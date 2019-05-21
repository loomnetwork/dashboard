
import BN from "bn.js"
import { Provider } from "ethers/providers"
import { ethers } from "ethers"
import { Observable } from "rxjs"

// Interface for application stores than include EthereumState
export interface HasEthereumState {
    ethereum: EthereumState
}

export interface EthereumState {
    // not really state but...
    provider: Provider|null
    address: string
    signer: ethers.Signer|null
    walletType: string
    // config: erc20 contracts addresses
    erc20Addresses: {
        loom: string
        [erc20Symbol: string]: string,
    }
    balances: {
        [erc20Symbol: string]: BN,
    }
}

export enum TokenSymbol {
    ETH = "eth",
    LOOM = "loom",
    BNB = "bnb",
}

export interface WalletType {
    id: string
    name: string
    isMultiAccount: boolean
    detectable: boolean
    detect: () => boolean
    desktop: boolean
    mobile: boolean
    createProvider(): Promise<ethers.providers.Web3Provider>
}

export interface MultiAccountWallet {
    isMultiAccount: true
    derivationPaths: Array<{label: string, path: string}>
    getAccounts(path: string, offset?: number, count?: number): Observable<AccountInfo>
}

export interface AccountInfo {
    address: string
    identicon: any
    eth?: number
    loom?: number
}

