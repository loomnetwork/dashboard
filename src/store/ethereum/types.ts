import BN from "bn.js"
import { ethers } from "ethers"
import { Observable } from "rxjs"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { GatewayState } from "../gateway/types"
import { provider } from "web3-providers"

export interface EthereumConfig {
  networkId: string
  networkName: string
  chainId: string
  endpoint: string

  /**
   * url template for links to transactions in a blockexplorer
   * (ie. etherscan)
   */
  blockExplorer: string
  etherScan: string
}

// Interface for application stores than include EthereumState
export interface HasEthereumState {
  ethereum: EthereumState
}

export interface EthereumState extends EthereumConfig {
  // not really state but...
  // see type provider in web3-provider
  provider: provider | null
  address: string
  signer: ethers.Signer | null
  walletType: string
  // config: erc20 contracts addresses
  erc20Addresses: {
    loom: string
    [erc20Symbol: string]: string,
  }
  balances: {
    [erc20Symbol: string]: BN,
  }
  loom: {
    contract: ERC20 | null
    balance: BN
    address: string,
  }
  coins: {
    loom: {
      balance: BN
      loading: boolean,
    }
    [coinSymbol: string]: {
      balance: BN
      loading: boolean,
    },
  }
}

export interface WalletType {
  id: string
  name: string
  isMultiAccount: boolean
  detectable: boolean
  detect: () => boolean
  desktop: boolean
  mobile: boolean
  // createProvider(): Promise<ethers.providers.Web3Provider>
  createProvider(): Promise<provider>
}

export interface MultiAccountWallet {
  isMultiAccount: true
  derivationPaths: Array<{ label: string; path: string }>
  getAccounts(
    path: string,
    offset?: number,
    count?: number,
  ): Observable<AccountInfo>
}

export interface AccountInfo {
  address: string
  identicon: any
  eth?: number
  loom?: number
}
