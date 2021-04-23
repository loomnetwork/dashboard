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
        // FIXME: Hardcoded to mainnet right now since WalletLink API is half-baked and doesn't provide
        // a way for the user to specify the network within the wallet app.
        if (chainId !== 1) {
            alert("WalletLink only works with mainnet for the moment " + config.networkId)
            window.location.reload()
        }
        const walletLink = new WalletLink({
            appName: "Loom Network - Basechain Dashboard",
        })
        const rpcUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        // const rpcUrl = `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`;
        // const chainId = 4;

        const wlProvider = walletLink.makeWeb3Provider(rpcUrl, chainId)

        let accounts: string[] = []
        try {
            accounts = await wlProvider.send("eth_requestAccounts")
        } catch (err) {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log("Use rejected WalletLink connection request")
            } else {
                console.error(err)
            }
        }
        if (accounts.length === 0) {
            throw new Error("Wallet is locked or the user has not connected any accounts")
        }
        const web3 = new Web3(wlProvider)
        web3.eth.defaultAccount = wlProvider.selectedAddress
        Object.defineProperties(wlProvider, { isMetaMask: { value: true } })
        const signer = new ethers.providers.Web3Provider(wlProvider).getSigner(wlProvider.selectedAddress)
        return {
            web3,
            signer,
            chainId,
            disconnect: () => wlProvider.disconnect() ? Promise.resolve() : Promise.reject("WalletLink: Could not disconnect"),
        }
    },
}
