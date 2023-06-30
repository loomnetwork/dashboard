/**
 * @module dpos-dashboard.ethereum
 */
import * as Sentry from "@sentry/browser"

import { ERC20 } from "@/store/plasma/web3-contracts/ERC20"
import { Transfer } from "@/types"
import BN from "bn.js"
import debug from "debug"
import { abi as ERC20ABI } from "loom-js/dist/mainnet-contracts/factories/ERC20__factory"
import { BareActionContext, getStoreBuilder } from "vuex-typex"
import Web3 from "web3"
import {
  EthereumConfig,
  EthereumState,
  HasEthereumState,
  IWalletProvider,
  WalletType,
} from "./types"
import { MetaMaskAdapter } from "./wallets/metamask"
import { tokenService } from "@/services/TokenService"
import {
  setBlockNumber,
  setLatestWithdrawalBlock,
  setClaimedReceiptHasExpired,
  initUserData,
  setUserData,
  deleteUserData,
  clearHistory,
  setWalletNetworkId,
} from "./mutations"
import { feedbackModule } from "@/feedback/store"
import { timer, Subscription } from "rxjs"
import { i18n } from "@/i18n"
import { WalletConnectAdapter } from "./wallets/walletconnect"
import { WalletLinkAdapter } from "./wallets/walletlink"
import { BinanceChainWalletAdapter, isBCWallet, BSC_SAFE_BLOCK_WAIT_TIME_MS } from "./wallets/binance"

declare type ActionContext = BareActionContext<EthereumState, HasEthereumState>

const log = debug("dash.ethereum")
const ZERO = new BN("0")

export const wallets: Map<string, WalletType> = new Map([
  ["metamask", MetaMaskAdapter],
  ["binance", BinanceChainWalletAdapter],
  ["walletconnect", WalletConnectAdapter],
  ["walletlink", WalletLinkAdapter],
])

const initialState: EthereumState = {
  networkId: "",
  networkName: "",
  genericNetworkName: "",
  chainId: "",
  nativeTokenSymbol: "",
  nativeTokenDecimals: 18,
  endpoint: "",
  blockExplorer: "",
  blockExplorerApi: "",
  address: "",
  signer: null,
  walletType: "",
  wallet: null,
  walletNetworkId: null,
  balances: {
    ETH: ZERO,
    LOOM: ZERO,
  },
  // not used
  LOOM: {
    contract: null,
    balance: ZERO,
    address: "",
  },
  coins: {
    LOOM: {
      balance: ZERO,
      loading: true,
      decimals: 18,
    },
  },
  contracts: {},
  blockNumber: 0,
  // TODO move to gateway module
  latestWithdrawalBlock: 0,
  claimedReceiptHasExpired: false,
  history: [],
  metamaskChangeAlert: false,
  userData: {
    pendingWithdrawal: false,
  },
  gatewayVersions: {
    main: 1,
    loom: 1,
  },
}

// web3 instance
let web3: Web3 | null

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

  get web3(): Web3 | null {
    return web3
  },

  getERC20,
  setConfig: builder.commit(setConfig),
  setUserData: builder.commit(setUserData),
  initUserData: builder.commit(initUserData),
  removeUserData: builder.commit(deleteUserData),

  refreshBalance: builder.dispatch(refreshBalance),
  approve: builder.dispatch(approve),
  transfer: builder.dispatch(transfer),

  setWalletType: builder.dispatch(setWalletType),
  setProvider: builder.dispatch(setProvider),
  clearWalletType: builder.commit(clearWalletType),
  commitSetWalletNetworkId: builder.commit(setWalletNetworkId),

  onLogout: builder.dispatch(onLogout),

  setToExploreMode: builder.dispatch(setToExploreMode),
  allowance: builder.dispatch(allowance),

  initERC20: builder.dispatch(initERC20),
  clearERC20: builder.dispatch(clearERC20),

  clearHistory: builder.commit(clearHistory),
  setBlockNumber: builder.commit(setBlockNumber),
  pollLastBlockNumber: builder.dispatch(pollLastBlockNumber),

  // TODO move these to gateway module
  setLatestWithdrawalBlock: builder.commit(setLatestWithdrawalBlock),
  setClaimedReceiptHasExpired: builder.commit(setClaimedReceiptHasExpired),
}

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<string, ERC20> = new Map()

function getERC20(token: string) {
  return erc20Contracts.get(token)
}

async function setWalletType(context: ActionContext, walletType: string) {
  const wallet = wallets.get(walletType)
  if (wallet === undefined) {
    console.error("unsupported wallet type " + walletType)
    // to do tell the user about the error
    return
  }
  context.state.walletType = walletType
  if (wallet.isMultiAccount === false) {
    feedbackModule.setTask(i18n.t("feedback_msg.task.connect_wallet").toString())
    feedbackModule.setStep(i18n.t("feedback_msg.task.connect_wallet").toString())

    try {
      const provider = await wallet.createProvider(context.state)
      disconnectWalletBeforeUnload(provider)
      await setProvider(context, provider)
    } catch(error) {
        Sentry.captureException(error)
        console.error(error)
        feedbackModule.endTask()
        feedbackModule.showError(i18n.t("feedback_msg.error.connect_wallet_prob").toString())
    }
  }
}

function disconnectWalletBeforeUnload(wallet) {
  const listener = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    wallet.disconnect()
    window.removeEventListener("beforeunload", listener)
  }
  window.addEventListener("beforeunload", listener)
}

async function setProvider(context: ActionContext, p: IWalletProvider) {
  web3 = p.web3
  const signer = p.signer
  const address = await signer.getAddress()
  context.state.signer = signer
  context.state.address = address
  context.state.wallet = p
  ethereumModule.commitSetWalletNetworkId(p.chainId)
}

async function onLogout(context: ActionContext) {
  const provider = context.state.wallet
  if (provider != null) {
    await provider.disconnect()
  }
}

async function setToExploreMode(context: ActionContext, address: string) {
  const endpoint = context.state.endpoint
  const web3Provider = /^ws/.test(endpoint) ?
    new Web3.providers.WebsocketProvider(endpoint) :
    new Web3.providers.HttpProvider(endpoint)

  web3 = new Web3(web3Provider)
  context.state.signer = null
  context.state.address = address
}

function setConfig(state: EthereumState, config: EthereumConfig) {
  log("config", config)
  Object.assign(state, config)
  // remove any web3 stuff
  web3 = null
}

function clearWalletType(state: EthereumState) {
  state.walletType = ""
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function refreshBalance(context: ActionContext, symbol: string) {
  if (!(symbol in context.state.coins)) {
    const info = tokenService.getTokenbySymbol(symbol)
    context.state.coins = Object.assign(
      context.state.coins,
      {
        [symbol]: {
          balance: ZERO,
          loading: true,
          decimals: info.decimals,
        },
      },
    )
  }
  // On Ethereum fetch the current user's ETH balance, on BSC fetch the BNB balance, etc.
  const nativeTokenSymbol = context.state.nativeTokenSymbol
  if (symbol === nativeTokenSymbol) {
    const b = await web3!.eth.getBalance(context.state.address)
    context.state.coins[nativeTokenSymbol].balance = new BN(b.toString())
    return
  }
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
  try {
    const result = await contract.methods
      .approve(to, weiAmount.toString())
      // @ts-ignore
      .send({
        from: context.state.address,
      })
    return result
  } catch (error) {
    if (isBCWallet(context.rootState.ethereum.wallet) &&
      (error as any).message.includes("Failed to subscribe to new newBlockHeaders to confirm the transaction receipts")) {
      await new Promise((resolve) => setTimeout(resolve, BSC_SAFE_BLOCK_WAIT_TIME_MS))
      // XXX when it fails it doesnt return the transaction hash
      return ""
    } else {
      throw error
    }
  }

}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export async function transfer(
  context: ActionContext,
  payload: Transfer,
): Promise<any> {
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
    .call({
      from: context.state.address,
    })
  return new BN(amount.toString())
}

export function initERC20(context: ActionContext, symbol: string) {
  log("initERC20", symbol, tokenService)
  const contractAddr = tokenService.getTokenAddressBySymbol(symbol, "ethereum")
  log("initERC20", symbol, contractAddr)
  if (contractAddr === undefined) {
    throw new Error("Could not find contract address for " + symbol)
  }
  // @ts-ignore
  const contract = new web3.eth.Contract(ERC20ABI, contractAddr) as ERC20
  erc20Contracts.set(symbol, contract)

  const account = context.state.address
  const refresh = () => ethereumModule.refreshBalance(symbol)

  // TODO: This probably only works when the web3 provider is hooked up to a websocket endpoint,
  //       which means it won't work with BSC (which has no official websocket endpoints).
  // out out filters
  const send = contract.events.Transfer(
    {
      fromBlock: "latest",
      filter: {
        from: account,
      },
    },
    refresh,
  )
  const receive = contract.events.Transfer(
    {
      fromBlock: "latest",
      filter: {
        to: account,
      },
    },
    refresh,
  )

  // For the deprecation warning see https://github.com/MetaMask/metamask-extension/issues/9301#issuecomment-680955280
  send.on("data", refresh)
  receive.on("data", refresh)

  ethereumModule.refreshBalance(symbol)

  return contract
}

export function clearERC20() {
  erc20Contracts.clear()
}

let pollingBlockNumber: Subscription | null = null

export function pollLastBlockNumber(context: ActionContext) {
  if (pollingBlockNumber != null) {
    pollingBlockNumber.unsubscribe()
  }
  pollingBlockNumber = timer(0, 15000).subscribe(async () => {
    const blockNumber = await web3!.eth.getBlockNumber()
    log("blockNumber", blockNumber)
    setBlockNumber(context.state, blockNumber)
  })
}
