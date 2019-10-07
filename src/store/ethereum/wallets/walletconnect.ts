import { WalletType, EthereumConfig } from "../types"

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
      bridge: "https://bridge.walletconnect.org",
      // infuraId: "5Ic91y0T9nLh6qUg33K0", // Required
      infuraId: "44ad2034a545495ca22dda2a4d50feba",
    })
    provider.on("chainChanged", (chainId) => console.log("chainChanged", chainId))
    provider.on("networkChanged", (net) => console.log("networkChanged", net))
    provider.on("accountsChanged", (acc) => window.location.reload())

    await provider.enable()
    return provider
  },

}
