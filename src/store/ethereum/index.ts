/**
 * @module dpos-dashboard.ethereum
 */

import { getStoreBuilder, ActionHandler } from "vuex-typex"

import { DashboardState, Transfer } from "@/types"

import { EthereumState, HasEthereumState, WalletType } from "./types"

import * as mutations from "./mutations"

import { ERC20 } from "@/store/plasma/web3-contracts/ERC20"
import { timer } from "rxjs"
import BN from "bn.js"
import { BareActionContext } from "vuex-typex"
import { TransferRequest } from "../plasma/types"
import { MetaMaskAdapter } from "./wallets/metamask"
import { LedgerAdapter } from "./wallets/ledger"
import { JsonRpcProvider, Web3Provider } from "ethers/providers"
import debug from "debug"
import { ParamType } from "ethers/utils"
import { Contract, ContractTransaction, ethers } from "ethers"

const log = debug("dboard.ethereum")

declare type ActionContext = BareActionContext<EthereumState, HasEthereumState>

import ERC20ABI from "loom-js/dist/mainnet-contracts/ERC20.json"
import { stat } from "fs"
import { state } from "../common"
import Web3 from "web3"
import { Providers } from "web3-core"
import { CommonTypedStore } from "../common"

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
    loom: "0x165245382ff23A5D3782b48286B6A81b6fd0508e",
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

// web3 instance
// @ see
let web3: Web3

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

  get web3() {
    return web3
  },

  getERC20,

  refreshBalance: builder.dispatch(refreshBalance),
  approve: builder.dispatch(approve),
  transfer: builder.dispatch(transfer),

  setWalletType: builder.dispatch(setWalletType),
  setToExploreMode: builder.dispatch(setToExploreMode),
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
      .then((web3provider) => {
        // context.state.provider = web3provider
        web3 = new Web3(web3provider)
        log("web3 provider", web3provider)
        // we need an ethers signer for eth signer.
        // @ts-ignore
        return new ethers.providers.Web3Provider(web3provider).getSigner()
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
    CommonTypedStore.setUserIsLoggedIn(true)
  }
}

async function setToExploreMode(context: ActionContext, address: string) {
  web3 = new Web3(new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws"))
  // Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws"));
  // Signer is not used in explore mode
  context.state.signer = null
  context.state.address = address
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function refreshBalance(context: ActionContext, symbol: string) {
  const contract = requireValue(erc20Contracts.get(symbol), "No contract found")
  const coinState = context.state.coins[symbol]
  coinState.loading = true
  return (
    contract.methods
      .balanceOf(context.state.address)
      // @ts-ignore
      .call({
        from: context.state.address,
      })
      .then((ethersBN) => {
        log("balanceOf %s %s ", symbol, ethersBN.toString())
        context.state.balances[symbol] = new BN(ethersBN.toString())
        coinState.balance = new BN(ethersBN.toString())
      })
      .finally(() => {
        coinState.loading = false
      })
  )
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
  await contract.methods
    .approve(to, weiAmount.toString())
    // @ts-ignore
    .send({
      from: context.state.address,
    })
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
  const tx = await contract.methods
    .transfer(to, weiAmount.toString())
    // @ts-ignore
    .send({
      from: context.state.address,
    })
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
  const amount = await contract.methods
    .allowance(context.state.address, spender)
    // @ts-ignore
    .send({
      from: context.state.address,
    })
  return new BN(amount.toString())
}

export function initERC20(context: ActionContext, symbol: string) {
  log("initERC20")
  const contractAddr = context.state.erc20Addresses[symbol]
  const web3: Web3 = ethereumModule.web3!
  // @ts-ignore
  const contract = new web3.eth.Contract(ERC20ABI, contractAddr) as ERC20
  erc20Contracts.set(symbol, contract)

  const account = context.state.address
  // out out filters
  const send = contract.events.Transfer({
    fromBlock: "latest",
    filter: {
      from: account,
    },
  })
  const receive = contract.events.Transfer({
    fromBlock: "latest",
    filter: {
      to: account,
    },
  })

  // const receive = contract.filters.Transfer(null, account, null)
  // contract.contract.on(send, refresh)
  // contract.on(receive, refresh)

  const refresh = () => ethereumModule.refreshBalance(symbol)
  send.on("data", refresh)
  receive.on("data", refresh)

  ethereumModule.refreshBalance(symbol)

  return contract
}

export function clearERC20() {
  erc20Contracts.clear()
}
