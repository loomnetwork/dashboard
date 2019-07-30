/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */

import { WalletType } from "../types"
import { ethereumModule } from ".."
import PrivateKeyProvider from "truffle-privatekey-provider"

export const TestWalletAdapter: WalletType = {
  id: "test_wallet",
  name: "Test Wallet",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: false,
  detect() {
    return true
  },
  async createProvider() {
    const provider = new PrivateKeyProvider(
      "348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709",
      ethereumModule.state.endpoint)

    return provider
  },
}

