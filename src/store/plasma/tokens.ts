import { Address } from "loom-js"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { ERC20 } from "./web3-contracts/ERC20"
import {
  PlasmaContext,
  TransferRequest,
  PlasmaTokenKind,
  PlasmaState,
} from "./types"
import { plasmaModule } from "."
import BN from "bn.js"
import { abi as ERC20ABI } from "loom-js/dist/mainnet-contracts/factories/ERC20__factory"
import debug from "debug"
import { setNewTokenToLocalStorage, ZERO } from "@/utils"
import { tokenService, TokenData } from "@/services/TokenService"
import { feedbackModule } from "@/feedback/store"
import { i18n } from "@/i18n"
import { formatTokenAmount } from "@/filters"
import * as Sentry from "@sentry/browser"
const log = debug("plasma")

export const contracts = new Map<string, ContractAdapter>()

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
    throw new Error("Unknow token " + tokenSymbol)
  }
  return adapter
}

export interface ContractAdapter {
  readonly contractAddress
  allowance(account: string, spender: string): Promise<BN>
  balanceOf(account: string): Promise<BN>
  // coin and eth coin return void, erc20 returns a transaction so keep it any here
  approve(spender: string, amount: BN): Promise<any>
  // coin and eth coin return void, erc20 returns a transaction so keep it any here
  transfer(to: string, amount: BN): Promise<any>
}

export class CoinAdapter implements ContractAdapter {
  get contractAddress() {
    return this.contract.address.local.toString().toLocaleLowerCase()
  }
  constructor(readonly token: string, public contract: Coin) { }

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
  constructor(readonly token: string, public contract: ERC20) { }
  get contractAddress() {
    return this.contract.options.address.toLocaleLowerCase()
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
  async allowance(account: string, to: string) {
    const caller = await plasmaModule.getCallerAddress()
    return this.contract.methods
      .allowance(account, to)
      .call({
        from: caller.local.toString(),
      })
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

export async function addToken(context: PlasmaContext, payload: { token: TokenData, walletId: string }) {
  const { token, walletId } = payload
  const state = context.state
  const web3 = state.web3!
  if (token.symbol in state.coins) {
    return
  }
  state.coins[token.symbol] = {
    decimals: token.decimals,
    balance: new BN("0"),
    loading: true,
  }
  state.coins = Object.assign({}, state.coins)
  log("add token state ", state.coins)
  let contract
  try {
    // @ts-ignore-next-line
    contract = new web3.eth.Contract(ERC20ABI, token.plasma) as ERC20
    await addContract(token.symbol, PlasmaTokenKind.ERC20, contract)
  } catch (error) {
    console.error("error ", error)
  }
  setNewTokenToLocalStorage(token, walletId)
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
  balanceState.loading = true
  try {
    const balance = await adapter.balanceOf(context.state.address)
    balanceState.balance = balance
  } catch (e) {
    console.error("Could not refresh balance of " + tokenSymbol)
    console.error(e)
  } finally {
    balanceState.loading = false
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
export async function approve(
  context: PlasmaContext,
  payload: TransferRequest,
): Promise<boolean> {
  const { symbol, to, fee } = payload
  const adapter = getAdapter(symbol)
  const balance = context.state.coins[symbol].balance
  const token = tokenService.getTokenbySymbol(symbol)
  let weiAmount = payload.weiAmount

  // If the transfer requires a fee, approve that also
  if (fee !== undefined) {
    // Same token do one approval
    if (fee.token === symbol) {
      weiAmount = weiAmount.add(fee.amount)
    } else {
      // Approve fee token first
      const feeApproved = await approve(context, { symbol: fee.token, weiAmount: fee.amount, to })
      if (!feeApproved) {
        return false
      }
    }
  }

  if (weiAmount.gt(balance)) {
    // TODO: fix error message
    throw new Error("plasma.approval.balance.low")
  }
  const currentAllowance = await adapter.allowance(context.state.address, to)
  if (currentAllowance.gte(weiAmount)) {
    return Promise.resolve(true)
  }
  // this somehow breaks on some accounts (for dpos), as if currentAllowance is wrong
  // const approvalAmount = weiAmount.sub(currentAllowance)
  const approvalAmount = weiAmount
  feedbackModule.setStep(
    i18n.t("feedback_msg.step.approving_spending",
  { tokenAmount: formatTokenAmount(approvalAmount, token.decimals), symbol: payload.symbol})
  .toString())
  try {
    await adapter.approve(to, approvalAmount)
    return true
  } catch (error) {
    if ((error as any).message.includes("User denied message")) {
      feedbackModule.showError(i18n.t("messages.user_denied_sign_tx").toString())
      feedbackModule.endTask()
    } else {
      feedbackModule.showError(
        i18n
          .t("messages.transaction_apprv_err_tx", { msg: (error as any).message })
          .toString(),
      )
      feedbackModule.endTask()
    }
    Sentry.withScope((scope) => {
      scope.setExtra("approve", {
        approval: JSON.stringify({
          symbol,
          to,
          fee,
          approvalAmount,
        }),
      })
      Sentry.captureException(error)
    })
    return false
  }
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
  const token = tokenService.getTokenbySymbol(symbol)
  if (weiAmount.gt(balance)) {
    throw new Error("plasma.transfer.balance.low")
  }

  // plasmaModule.refreshBalance(payload.symbol)
  feedbackModule.setTask(i18n.t("feedback_msg.task.transfer_token").toString())
  feedbackModule.setStep(
    i18n.t("feedback_msg.step.transfering_token",
  { tokenAmount: formatTokenAmount(weiAmount, token.decimals), symbol: payload.symbol})
  .toString())
  await adapter.transfer(to, weiAmount)
  feedbackModule.endTask()
}
