/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */

import { ethers } from "ethers"

import { WalletType } from "../types"
import { provider } from "web3-providers"
import { feedbackModule } from "@/feedback/store"
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
  async createProvider() {
    if (isCurrentApi()) {
      return getCurrentApi()
    } else if (isLegacyApi()) {
      return getLegacyApi()
    }
    throw new Error("no Metamask installation detected")
  },
}

function isLegacyApi() {
  // @ts-ignore
  return "web3" in window
}

function isCurrentApi() {
  // @ts-ignore
  return "ethereum" in window
}

function getLegacyApi(): Promise<provider> {
  // @ts-ignore
  return window.web3.currentProvider
}

async function getCurrentApi(): Promise<provider> {
  try {
    // @ts-ignore
    await window.ethereum.enable()
    // @ts-ignore
    // return new ethers.providers.Web3Provider(window.ethereum)

    // @ts-ignore
    window.ethereum.on("accountsChanged", (accounts) => {
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
        // @ts-ignore
        window.ethereum.removeAllListeners()
      }
    })

    // @ts-ignore
    return window.ethereum
  } catch (err) {
    feedbackModule.endTask()
    throw Error("User denied access to Metamask")
  }
}
