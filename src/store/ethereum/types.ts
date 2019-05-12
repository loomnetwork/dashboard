
import BN from "bn.js"
import { Provider } from "ethers/providers";

// Interface for application stores than include EthereumState
export interface HasEthereumState {
    ethereum: EthereumState
}

export interface EthereumState {
    // not really state but...
    provider:Provider|null
    
    // config: erc20 contracts addresses
    erc20Addresses: {
        loom:string
        [erc20Symbol:string]:string        
    }
    balances: {
        [erc20Symbol:string]:BN
    }
}

export enum TokenSymbol {
    ETH = "eth",
    LOOM = "loom",
    BNB = "bnb",
}