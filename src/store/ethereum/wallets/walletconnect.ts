import { ethers } from "ethers"
import { WalletType, EthereumConfig } from "../types"

import Web3 from "web3"
import WalletConnectProvider from "@walletconnect/web3-provider"

export const WalletConnectAdapter: WalletType = {
  id: "walletconnect",
  name: "WalletConnect",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  detect() {
    return true
  },
  async createProvider(config: EthereumConfig) {

    const net = config.networkId === "1" ? "mainnet" : "rinkeby"

    const provider = new WalletConnectProvider({
      bridge: "https://bridge.walletconnect.org" // Required
    })

    return new Promise((resolve, reject) => {
      resolve(provider)
    })

  },

}
