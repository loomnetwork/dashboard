/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */

import { ethers } from "ethers"

import { WalletType } from "../types"
import { provider } from "web3-providers"
import { feedbackModule } from "@/feedback/store"

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
<<<<<<< HEAD

=======
>>>>>>> dd89e745c30d01f7d67c829c085c49a2067950ca
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
  return "ethereum" in window && window.ethereum.isMetaMask
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
    return window.ethereum
  } catch (err) {
    feedbackModule.endTask()
    throw Error("User denied access to Metamask")
  }
}
