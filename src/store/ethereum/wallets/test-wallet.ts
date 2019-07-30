/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */

import { WalletType } from "../types"
import Web3 from "web3"
import { ethereumModule } from ".."

export const TestWalletAdapter: WalletType = {
  id: "test_wallet",
  name: "Test Wallet",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: false,
  detect() {
    return isCurrentApi() || isLegacyApi()
  },
  async createProvider() {
    const web3 = new Web3(new Web3.providers.HttpProvider(ethereumModule.state.endpoint))
    const account = web3.eth.accounts
      .privateKeyToAccount("0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709")

    web3.eth.accounts.wallet.add(account)
    web3.eth.defaultAccount = account.address

    return web3.currentProvider
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
