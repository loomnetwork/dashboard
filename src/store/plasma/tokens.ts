import { Address } from "loom-js"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { ERC20 } from "./web3-contracts/ERC20"
import ERC20abi from "loom-js/dist/mainnet-contracts/ERC20.json"
import {
  PlasmaContext,
  TransferRequest,
  PlasmaTokenKind,
  PlasmaState,
} from "./types"
import { plasmaModule } from "."
import BN from "bn.js"
import TOKENS from "@/data/topTokensSymbol.json"
import BoosterPackJson from "@/contracts/BoosterPack.json"
const ERC20ABI = require("loom-js/dist/mainnet-contracts/ERC20.json")
import debug from "debug"
import { setNewTokenToLocalStorage, ZERO } from "@/utils"
import TokenService from "@/services/TokenService"

const log = debug("plasma")

const contracts = new Map<string, ContractAdapter>()

export function resetContracts() {
  contracts.clear()
}

/**
 *
 * @param symbol
 * @param kind
 * @param contract one of Coin | EthCoin | ERC20.
 * Not that these must correspond to the token kind passed in `kind` argument
 */
export async function addContract(
  symbol: string,
  kind: PlasmaTokenKind,
  contract: Coin | EthCoin | ERC20,
) {
  let adapter: ContractAdapter
  switch (kind) {
    case PlasmaTokenKind.LOOMCOIN:
      adapter = new CoinAdapter(symbol, contract as Coin)
      break
    case PlasmaTokenKind.ETH:
      adapter = new CoinAdapter(symbol, contract as EthCoin)
      break
    case PlasmaTokenKind.ERC20:
      adapter = new ERC20Adapter(symbol, contract as ERC20)
      break
    default:
      throw new Error("Unsupported token kind " + kind)
  }
  contracts.set(symbol, adapter)
}

/**
 * returns the corresponding adapter. Throws if not found
 * @param tokenSymbol
 */
export function getAdapter(tokenSymbol: string): ContractAdapter {
  const adapter = contracts.get(tokenSymbol)
  if (adapter === undefined) {
    debugger
    throw new Error("Unknow token " + tokenSymbol)
  }
  return adapter
}

interface ContractAdapter {
  readonly contractAddress
  allowance(account: string, spender: string): Promise<BN>
  balanceOf(account: string): Promise<BN>
  // coin and eth coin return void, erc20 returns a transaction so keep it any here
  approve(spender: string, amount: BN): Promise<any>
  // coin and eth coin return void, erc20 returns a transaction so keep it any here
  transfer(to: string, amount: BN): Promise<any>
}

class CoinAdapter implements ContractAdapter {
  get contractAddress() {
    return this.contract.address.local.toString().toLocaleLowerCase()
  }
  constructor(readonly token: string, public contract: Coin) {}

  balanceOf(account: string) {
    const chainId = this.contract.address.chainId
    const address = Address.fromString(chainId + ":" + account)
    return this.contract.getBalanceOfAsync(address)
  }
  allowance(account: string, to: string) {
    return this.contract.getAllowanceAsync(
      this.toAddress(account),
      this.toAddress(to),
    )
  }
  approve(to: string, amount: BN) {
    return this.contract.approveAsync(this.toAddress(to), amount)
  }
  transfer(to: string, amount: BN) {
    return this.contract.transferAsync(this.toAddress(to), amount)
  }

  private toAddress(strAddress: string) {
    const chainId = this.contract.address.chainId
    return Address.fromString(chainId + ":" + strAddress)
  }
}

class ERC20Adapter implements ContractAdapter {
  constructor(readonly token: string, public contract: ERC20) {}
  get contractAddress() {
    return this.contract.address.toLocaleLowerCase()
  }
  async balanceOf(account: string) {
    const caller = await plasmaModule.getCallerAddress()
    return this.contract.methods
      .balanceOf(account)
      .call({
        from: caller.local.toString(),
      })
      .then((v) => new BN(v.toString()))
  }
  allowance(account: string, to: string) {
    return this.contract.methods
      .allowance(account, to)
      .call()
      .then((v) => new BN(v))
  }
  async approve(to: string, amount: BN) {
    const caller = await plasmaModule.getCallerAddress()
    return this.contract.methods
      .approve(to, amount.toString())
      .send({ from: caller.local.toString() })
  }
  async transfer(to: string, amount: BN) {
    const caller = await plasmaModule.getCallerAddress()
    const result = await this.contract.methods
      .transfer(to, amount.toString())
      .send({ from: caller.local.toString() })
    console.log("transferred.")
    console.log("transferred result", result)
    return result
  }
}

export function addCoinState(state: PlasmaState, symbol: string) {
  state.coins[symbol] = {
    decimals: 18,
    balance: ZERO,
    loading: true,
  }
}

export async function addToken(context: PlasmaContext, tokenSymbol: string) {
  const state = context.state
  const symbol = tokenSymbol.toUpperCase()
  const token = TokenService.getTokenbySymbol(symbol)
  const web3 = state.web3!
  // const network = state.networkId // 'us1'
  const chain = "plasma"
  if (token === undefined) {
    throw new Error("Could not find token symbol " + tokenSymbol)
  }
  const address = TokenService.getTokenAddressBySymbol(symbol, chain)
  if (!(symbol in state.coins)) {
    state.coins[token.symbol] = {
      decimals: token.decimals,
      balance: new BN("0"),
      loading: true,
    }
    state.coins = Object.assign({}, state.coins)
    log("add token state ", state.coins)
    let contract
    try {
      contract = new web3.eth.Contract(ERC20ABI, address) as ERC20
      await addContract(tokenSymbol, PlasmaTokenKind.ERC20, contract)
    } catch (error) {
      console.error("error ", error)
    }
    setNewTokenToLocalStorage(symbol)
  }
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function refreshBalance(
  context: PlasmaContext,
  tokenSymbol: string,
) {
  const adapter = getAdapter(tokenSymbol)
  // caution make sure balanceState is always set befor calling refreshBalance
  const balanceState = context.state.coins[tokenSymbol.toUpperCase()]
  try {
    const balance = await adapter.balanceOf(context.state.address)
    balanceState.balance = balance
  } catch (e) {
    console.error("Could not refresh balance of " + tokenSymbol)
    console.error(e)
  }
}

/**
 * does not change the state...
 * @param context
 * @param payload
 */
export async function allowance(
  context: PlasmaContext,
  payload: { token: string; spender: string },
) {
  const adapter = getAdapter(payload.token)
  return adapter.allowance(context.state.address, payload.spender)
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approve(context: PlasmaContext, payload: TransferRequest) {
  const { symbol, weiAmount, to } = payload
  const adapter = getAdapter(symbol)
  const balance = context.state.coins[symbol].balance

  if (weiAmount.gt(balance)) {
    throw new Error("plasma.approval.balance.low")
  }
  return adapter.approve(to, weiAmount)
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export async function transfer(
  context: PlasmaContext,
  payload: TransferRequest,
) {
  const { symbol, weiAmount, to } = payload
  const adapter = getAdapter(symbol)
  const balance = context.state.coins[symbol].balance
  if (weiAmount.gt(balance)) {
    throw new Error("plasma.transfer.balance.low")
  }

  // plasmaModule.refreshBalance(payload.symbol)
  return await adapter.transfer(to, weiAmount)
}
