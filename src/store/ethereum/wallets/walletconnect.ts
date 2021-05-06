import WalletConnectProvider from "@walletconnect/web3-provider"
import { IWalletConnectProviderOptions } from "@walletconnect/types"
import { getMetamaskSigner } from "loom-js"
import { Signer } from "ethers"
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
    const opts: IWalletConnectProviderOptions = {}
    if (config.genericNetworkName === "Ethereum") {
      opts.infuraId = `${process.env.INFURA_PROJECT_ID}`
    } else {
      opts.chainId = parseInt(config.networkId, 10)
      opts.rpc = { [opts.chainId]: config.endpoint }
    }
    const wcProvider = new WalletConnectProvider(opts)
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
    wcProvider.on("disconnect", (code, reason) => {
      console.log(`WalletConnect session disconnected, ${code}, reason ${reason}`)
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
