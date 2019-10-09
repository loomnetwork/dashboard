import { WalletType, EthereumConfig } from "../types"

import WalletConnectProvider from "@walletconnect/web3-provider"
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal"

const INITIAL_STATE = {
  walletConnector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
}

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
    // wc is WalletConnect class in library
    provider.wc.on('disconnect', (error, payload) => {
      if (error) {
        throw error
      }
      console.log("User cancel a sign-in request")
      WalletConnectQRCodeModal.close()
      provider.updateState({...INITIAL_STATE})
    })

    await provider.enable()
    return provider
  },
}
