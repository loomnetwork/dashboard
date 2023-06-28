import BN from "bn.js"
import { ethers, Signer } from "ethers"
import { Observable } from "rxjs"
import { ERC20__factory as ERC20Factory } from "loom-js/dist/mainnet-contracts/factories/ERC20__factory"
import Web3 from "web3"

export interface EthereumConfig {
  networkId: string
  networkName: string
  genericNetworkName: string
  chainId: string
  nativeTokenSymbol: string
  nativeTokenDecimals: number
  endpoint: string
  blockExplorer: string
  blockExplorerApi: string
  contracts: { [name: string]: string }
  formaticKey?: string
  portisKey?: string
  gatewayVersions: {
    loom: 1 | 2,
    main: 1 | 2,
  },
}

// Interface for application stores than include EthereumState
export interface HasEthereumState {
  ethereum: EthereumState
}

export interface EthereumState extends EthereumConfig {
  address: string
  signer: ethers.Signer | null
  walletType: string
  wallet: IWalletProvider | null
  walletNetworkId: number | null // ID of foreign network the wallet is connected to (if any)
  balances: {
    [erc20Symbol: string]: BN,
  }
  LOOM: {
    contract: ERC20Factory | null
    balance: BN
    address: string,
  }
  coins: {
    LOOM: {
      balance: BN
      loading: boolean,
      decimals: number,
    }
    [coinSymbol: string]: {
      balance: BN
      loading: boolean,
      decimals: number,
    },
  },
  blockNumber: number,
  // TODO move to gateway module
  latestWithdrawalBlock: number,
  claimedReceiptHasExpired: boolean, // TODO: get rid of this, it's not used
  history: any[],
  metamaskChangeAlert: boolean,
  userData: {
    pendingWithdrawal: boolean,
  },
}

export interface IWalletProvider {
  web3: Web3,
  signer: Signer,
  chainId: number,
  disconnect(): Promise<void>,
}
export interface WalletType {
  id: string
  name: string
  logo: string
  isMultiAccount: boolean
  detectable: boolean
  detect: () => boolean
  desktop: boolean
  mobile: boolean

  createProvider(config: EthereumConfig): Promise<IWalletProvider>
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
  ETH?: number
  LOOM?: number
}
