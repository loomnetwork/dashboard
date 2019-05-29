/**
 * @module dpos-dashboard.ethereum
 */

import { getStoreBuilder } from "vuex-typex"

import { DashboardState, Transfer } from "@/types"

import { EthereumState, HasEthereumState, WalletType } from "./types"

import * as mutations from "./mutations"

import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import BN from "bn.js"
import { BareActionContext } from "vuex-typex"
import { TransferRequest } from "../plasma/types"
import { MetaMaskAdapter } from "./wallets/metamask"
import { LedgerAdapter } from "./wallets/ledger"
import { JsonRpcProvider } from "ethers/providers"
import debug from "debug"
import { ParamType } from "ethers/utils"
import { Contract, ContractTransaction } from "ethers"

const log = debug("dboard.ethereum")

declare type ActionContext = BareActionContext<EthereumState, HasEthereumState>

const ERC20ABIs: ParamType[] = require("loom-js/dist/mainnet-contracts/ERC20.json")
import ERC20ABI from "loom-js/dist/mainnet-contracts/ERC20.json"
import { stat } from "fs"
import { state } from "../common"

const ZERO = new BN("0")

const wallets: Map<string, WalletType> = new Map([
  ["metamask", MetaMaskAdapter],
  ["ledger", LedgerAdapter],
])

const initialState: EthereumState = {
  provider: null,
  address: "",
  signer: null,
  walletType: "",
  erc20Addresses: {
    // us1
    loom: "0x425532c6a0b0327bbd702ad7a1ab618b1e86289d",
    bnb: "",
    usdc: "",
  },
  balances: {
    eth: ZERO,
    loom: ZERO,
  },
  loom: {
    contract: null,
    balance: ZERO,
    address: "",
  },
  coins: {
    loom: {
      balance: ZERO,
      loading: true,
    },
  },
}

const builder = getStoreBuilder<HasEthereumState>().module(
  "ethereum",
  initialState,
)
const stateGetter = builder.state()

function requireValue<T>(v: T | null | undefined, errorMessage: string): T {
  if (v === null || v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}

// vuex typedd module
export const ethereumModule = {
  get state() {
    return stateGetter()
  },

  getERC20,

  refreshBalance: builder.dispatch(refreshBalance),
  approve: builder.dispatch(approve),
  transfer: builder.dispatch(transfer),

  setWalletType: builder.dispatch(setWalletType),
  allowance: builder.dispatch(allowance),

  initERC20: builder.dispatch(initERC20),
  clearERC20: builder.dispatch(clearERC20),
}

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<string, ERC20> = new Map()

function getERC20(token: string) {
  return erc20Contracts.get(token)
}

async function setWalletType(context: ActionContext, walletType: string) {
  const wallet = wallets.get(walletType)
  if (wallet === undefined) {
    console.error("unsuported wallet type " + walletType)
    // to do tell the user about the error
    return
  }
  context.state.walletType = walletType
  if (wallet.isMultiAccount === false) {
    wallet
      .createProvider()
      .then((provider) => {
        context.state.provider = provider
        log("provider", provider)
        return provider.getSigner()
      })
      .then((signer) => {
        context.state.signer = signer
        log("signer", signer)
        return signer.getAddress()
      })
      .then((address) => {
        log("address", address)
        context.state.address = address
        log("wallet set")
      })
      .catch((e) => {
        console.error(e)
      })
  }
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function refreshBalance(context: ActionContext, symbol: string) {
  const contract = requireValue(
    erc20Contracts.get(symbol),
    "No contract found",
  )
  const coinState = context.state.coins[symbol]
  coinState.loading = true
  return contract.functions
    .balanceOf(context.state.address)
    .then((ethersBN) => {
      log("balanceOf %s %s ", symbol, ethersBN.toString())
      context.state.balances[symbol] = new BN(ethersBN.toString())
      coinState.balance = new BN(ethersBN.toString())
    })
    .finally(() => {
      coinState.loading = false
    })
}

/**
 * approve amount for ERC20 tokens
 * @param symbol
 * @param tokenAmount
 */
export async function approve(context: ActionContext, payload: Transfer) {
  const { symbol, weiAmount, to } = payload
  const contract = requireValue(
    erc20Contracts.get(symbol),
    "Contract not initialized",
  )
  await contract.functions.approve(to, weiAmount.toString())
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export async function transfer(
  context: ActionContext,
  payload: Transfer,
): Promise<ContractTransaction> {
  const { symbol, weiAmount, to } = payload
  const contract = requireValue(
    erc20Contracts.get(symbol),
    "Contract not initialized",
  )
  const tx = await contract.functions.transfer(to, weiAmount.toString())
  log("transfer", tx)
  return tx
}

export async function allowance(
  context: ActionContext,
  payload: { symbol: string; spender: string },
): Promise<BN> {
  const { symbol, spender } = payload
  const contract = requireValue<ERC20>(
    erc20Contracts.get(symbol),
    "Expected contract",
  )
  const amount = await contract.functions.allowance(
    context.state.address,
    spender,
  )
  return new BN(amount.toString())
}

export function initERC20(context: ActionContext, symbol: string) {
  const provider = context.state.provider!
  const contractAddr = context.state.erc20Addresses[symbol]
  const contract = new Contract(contractAddr, ERC20ABI, provider) as ERC20
  erc20Contracts.set(symbol, contract)

  const account = context.state.address
  // out out filters
  const send = contract.filters.Transfer(account, null, null)
  const receive = contract.filters.Transfer(null, account, null)

  const refresh = () => ethereumModule.refreshBalance(symbol)

  ethereumModule.refreshBalance(symbol)
  contract.on(send, refresh)
  contract.on(receive, refresh)

  return contract
}

export function clearERC20() {
  erc20Contracts.clear()
}
