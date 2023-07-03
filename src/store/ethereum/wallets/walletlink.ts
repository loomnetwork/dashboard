import { ethers } from "ethers"
import Web3 from "web3"
import CoinbaseWalletSDK from "@coinbase/wallet-sdk"

import { WalletType, EthereumConfig, IWalletProvider } from "../types"

export const WalletLinkAdapter: WalletType = {
    id: "walletlink",
    name: "Coinbase Wallet",
    logo: require("@/assets/walletlink-logo.png"),
    detectable: true,
    isMultiAccount: false,
    desktop: true,
    mobile: true,

    detect() {
        return true
    },

    async createProvider(config: EthereumConfig): Promise<IWalletProvider> {
        const chainId = parseInt(config.networkId, 10)
        const walletLink = new CoinbaseWalletSDK({
            appName: "Loom Network - Basechain Dashboard",
        })
        // In config we use websockets urls, but that's not supported by the Coinbase Wallet yet.
        // For well known chains Coinbase Wallet should use its own endpoints, but fallback
        // endpoints must be specified.
        // const rpcUrl = config.endpoint
        const rpcUrl = chainId === 1 ?
            `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}` :
            undefined

        if (!rpcUrl) {
            throw new Error(`Coinbase Wallet not configured for ${config.networkName}`)
        }

        const wlProvider = walletLink.makeWeb3Provider(rpcUrl, chainId)
        
        let accounts: string[] = []
        try {
            accounts = await wlProvider.send("eth_requestAccounts")
        } catch (err) {
            if ((err as any).code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log("User rejected Coinbase Wallet connection request")
            } else {
                console.error(err)
            }
        }
        if (accounts.length === 0) {
            throw new Error("Coinbase Wallet is locked or the user has not connected any accounts")
        }

        // @ts-expect-error missing properties in CoinbaseWalletProvider
        const web3Provider = new ethers.providers.Web3Provider(wlProvider)
        const signer = web3Provider.getSigner(wlProvider.selectedAddress)
        return {
            web3: new Web3(wlProvider),
            signer,
            chainId,
            disconnect() {
                walletLink.disconnect()
                return Promise.resolve()
            },
        }
    },
}
