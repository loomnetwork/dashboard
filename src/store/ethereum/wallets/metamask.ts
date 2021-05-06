/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */
import * as Sentry from "@sentry/browser"
import { provider as Web3Provider} from "web3-providers"
import { feedbackModule } from "@/feedback/store"
import Web3 from "web3"
import { getMetamaskSigner } from "loom-js"

import { IWalletProvider, WalletType } from "../types"
import { ethereumModule } from ".."

export const MetaMaskAdapter: WalletType = {
  id: "netamask",
  name: "Metamask",
  logo: require("@/assets/metamask_logo.png"),
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: false,
  detect: isMetamaskPresent,
  async createProvider(): Promise<IWalletProvider> {
    if (!isMetamaskPresent()) {
      throw new Error("no Metamask installation detected")
    }
    const provider = await getCurrentApi()
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

function isMetamaskPresent() {
  // @ts-ignore
  return "ethereum" in window && window.ethereum.isMetaMask
}

async function getCurrentApi(): Promise<Web3Provider> {
  // @ts-ignore
  const ethereum: any = window.ethereum
  try {
    await ethereum.request({ method: "eth_requestAccounts" })
  } catch (err) {
    Sentry.captureException(err)
    feedbackModule.endTask()
  }

  ethereum.autoRefreshOnNetworkChange = false
  ethereum.on(
    "chainChanged",
    (chainId: string) => ethereumModule.commitSetWalletNetworkId(parseInt(chainId, 16)),
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
