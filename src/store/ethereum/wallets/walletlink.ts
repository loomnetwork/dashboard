import { ethers } from "ethers"
import Web3 from "web3"
import WalletLink from "walletlink"

import { WalletType, EthereumConfig, IWalletProvider } from "../types"

export const WalletLinkAdapter: WalletType = {
    id: "walletlink",
    name: "WalletLink",
    detectable: true,
    isMultiAccount: false,
    desktop: true,
    mobile: true,
    detect() {
        return true
    },
    async createProvider(config: EthereumConfig): Promise<IWalletProvider> {
        const chainId = parseInt(config.networkId, 10)
        const walletLink = new WalletLink({
            appName: "Loom Network - Basechain Dashboard",
        })
        // In config we use websockets. Not supported by walletlink yet.
        // const rpcUrl = config.endpoint
        const rpcUrl = chainId === 1 ?
            `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}` :
            `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`

        const wlProvider = walletLink.makeWeb3Provider(rpcUrl, chainId)
        wlProvider.enable()

        let accounts: string[] = []
        try {
            accounts = await wlProvider.send("eth_requestAccounts")
        } catch (err) {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log("User rejected WalletLink connection request")
            } else {
                console.error(err)
            }
        }
        if (accounts.length === 0) {
            throw new Error("Wallet is locked or the user has not connected any accounts")
        }
        const web3 = new Web3(wlProvider)

        // See https://github.com/walletlink/walletlink/issues/19
        // Said to be fixed in version 2 but it seems not to be the case.
        // @ts-ignore
        wlProvider.on = null
        Object.defineProperties(wlProvider, { isMetaMask: { value: true } })
        const signer = new ethers.providers.Web3Provider(wlProvider).getSigner(wlProvider.selectedAddress)
        return {
            web3,
            signer,
            chainId,
            disconnect() {
                walletLink.disconnect()
                return Promise.resolve()
            },
        }
    },
}
