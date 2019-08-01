import { WalletType, EthereumConfig } from "../types"
import Fortmatic from "fortmatic"

export const FortmaticAdapter: WalletType = {
  id: "fortmatic",
  name: "Fortmatic",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  detect() {
    return true
  },
  async createProvider(config: EthereumConfig) {
    const net = config.networkId === "1" ? "mainnet" : "rinkeby"
    const key = config.formaticKey
    // dappID and network will be change later
    const fm = new Fortmatic(key, net)
    const provider = fm.getProvider()
    await provider.enable()
    return provider
  },
}
