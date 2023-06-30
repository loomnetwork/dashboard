import { EthereumProvider } from "@walletconnect/ethereum-provider"
import { getMetamaskSigner } from "loom-js"
import Web3 from "web3"

import { WalletType, EthereumConfig, IWalletProvider } from "../types"
import { ethereumModule } from ".."

export const WalletConnectAdapter: WalletType = {
  id: "walletconnect",
  name: "WalletConnect",
  logo: require("@/assets/walletconnect-logo.svg"),
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  
  detect() {
    return true
  },
  
  async createProvider(config: EthereumConfig): Promise<IWalletProvider> {
    // WalletConnect session restore is unreliable so clear it out every time
    // a new provider is created so the user is prompted to scan QR code to connect
    Object.keys(localStorage).filter(x =>x.startsWith('wc@2:')).forEach(x => localStorage.removeItem(x))

    const chainId = parseInt(config.networkId, 10)
    const wcProvider = await EthereumProvider.init({
      projectId: `${process.env.WALLETCONNECT_PROJECT_ID}`,
      chains: [chainId],
      rpcMap: { chainId: config.endpoint },
      showQrModal: true, // requires @walletconnect/modal
      qrModalOptions: {
        enableExplorer: false,
        themeMode: "dark",
        themeVariables: {
          "--w3m-z-index": "9999",
        },
      },
    })

    wcProvider.on(
      "chainChanged",
      (chainId: string) => {
        console.log(`WalletConnect chainChanged ${chainId}`)
        ethereumModule.commitSetWalletNetworkId(parseInt(chainId, 16))
      },
    )
    // NOTE: WC seems to emit accountsChanged every time the provider is enabled, unlike MetaMask.
    wcProvider.on("accountsChanged", (accounts: string[]) => {
      console.log(`WalletConnect accountsChanged ${accounts}`)
    })
    wcProvider.on("disconnect", (err) => {
      console.log(`WalletConnect session disconnected, ${err.code}: ${err.message}}`)
      window.location.reload()
    })

    // enable session (triggers QR Code modal)
    await wcProvider.enable()

    return {
      web3: new Web3(wcProvider),
      signer: getMetamaskSigner(wcProvider),
      chainId: wcProvider.chainId,
      disconnect: () => wcProvider.disconnect(),
    }
  },
}
