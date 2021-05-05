/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */
import * as Sentry from "@sentry/browser"
import { provider } from "web3-providers"
import { feedbackModule } from "@/feedback/store"
import Web3 from "web3"
import { getMetamaskSigner } from "loom-js"

import { EthereumConfig, IWalletProvider, WalletType } from "../types"
import { ethereumModule } from ".."

export const MetaMaskAdapter: WalletType = {
  id: "netamask",
  name: "Metamask",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: false,
  detect() {
    return isCurrentApi() || isLegacyApi()
  },
  async createProvider(): Promise<IWalletProvider> {
    let provider
    if (isCurrentApi()) {
      provider = await getCurrentApi()
    } else if (isLegacyApi()) {
      provider = getLegacyApi()
    }
    if (!provider) {
      throw new Error("no Metamask installation detected")
    }
    const signer = getMetamaskSigner(provider)
    const network = await signer.provider!.getNetwork()
    return {
      web3: new Web3(provider),
      signer,
      chainId: network.chainId,
      disconnect: () => Promise.resolve(),
    }
  },
}

function isLegacyApi() {
  return "web3" in window
}

function isCurrentApi() {
  return "ethereum" in window
}

function getLegacyApi(): Promise<provider> {
  // @ts-ignore
  return window.web3.currentProvider
}

async function getCurrentApi(): Promise<provider> {
  // @ts-ignore
  const ethereum: any = window.ethereum
  try {
    await ethereum.enable()
  } catch (err) {
    Sentry.captureException(err)
    feedbackModule.endTask()
  }

  ethereum.autoRefreshOnNetworkChange = false
  ethereum.on(
    "chainChanged",
    (chainId: string) => ethereumModule.commitSetWalletNetworkId(parseInt(chainId, 16))
  )

  try {
    // The following throws on Trust
    ethereum.on("accountsChanged", (accounts) => {
      // TODO: this is to resolve a bug with mismatched receipts, once all users are fixed, please remove.
      // @ts-ignore
      if (window.resolvingMismatchedReceipt) {
        return
      }
      if (ethereumModule.state.address &&
        ethereumModule.state.address.toLowerCase() !== accounts[0]) {
        // Remove any reference to past withdrawals as
        // it is bound to a specific address
        localStorage.removeItem("lastWithdrawTime")
        ethereumModule.state.metamaskChangeAlert = true
        ethereum.removeAllListeners()
      }
    })
  } catch (err) {
    Sentry.captureException(err)
  }

  return ethereum
}

/**
 * See https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
 */
export function addNetwork(bscConf: EthereumConfig) {
  if (!isCurrentApi()) throw new Error("Please update Metamask")

  let chainName = bscConf.genericNetworkName
  // ...
  if (bscConf.networkName.includes("testnet")) {
    chainName = "Testnet - " + chainName
  }

  const params = {
    chainId: `0x${Number(bscConf.networkId).toString(16)}`,
    chainName,
    nativeCurrency: {
      symbol: bscConf.nativeTokenSymbol,
      decimals: bscConf.nativeTokenDecimals,
    },
    rpcUrls: [bscConf.endpoint],
    blockExplorerUrls: [bscConf.blockExplorer],
  }
  // @ts-ignore
  const p: any = window.ethereum
  p.request({
    method: "wallet_addEthereumChain",
    params: [params],
  }).then(() => true)
    .catch((error: Error) => {
      console.error(error)
      return false
    })
}
