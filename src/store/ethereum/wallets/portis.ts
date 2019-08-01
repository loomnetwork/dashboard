import { ethers } from "ethers"

import { WalletType, EthereumConfig } from "../types"

import Portis from "@portis/web3"
import Web3 from "web3"

export const PortisAdapter: WalletType = {
  id: "portis",
  name: "Portis",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  detect() {
    return true
  },
  async createProvider(config: EthereumConfig) {
    const net = config.networkId === "1" ? "mainnet" : "rinkeby"
    const key = config.portisKey!
    // dappID and network will be change later
    const portis = new Portis(key, net)
    portis.showPortis()
    return new Promise((resolve, reject) => {
      portis.onLogin(() => resolve(portis.provider))
    })
  },
}
