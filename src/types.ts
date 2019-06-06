import { AddressMapper, DPOS3 } from "loom-js/dist/contracts"
import { Client, DPOSUserV3 } from "loom-js"
import { HasGatewayState } from "./store/gateway/types"
import { CommonState } from "./store/common/types"
import { Contract } from "web3-eth-contract"
import BN from "bn.js"
import { HasDPOSState } from "./store/dpos/types"
import { HasEthereumState } from "./store/ethereum/types"
import { HasPlasmaState } from "./store/plasma/types"
import { HasAssetsState } from "./store/plasma/assets/types"
import { HasWhiteListState } from "./store/whitelist/types";

export interface DashboardState
  extends HasGatewayState,
    HasDPOSState,
    HasWhiteListState,
    HasAssetsState {
  // remove
  DPOS: DposState
  // DappChain: DappchainState
  common: CommonState
}

export interface UserBalance {
  isLoading: boolean
  loomBalance: any
  mainnetBalance: any
  stakedAmount: any
}

export interface DposState {
  GatewayInstance: Contract | null
  showSigningAlert: boolean
  mappingStatus: string
  isConnectedToDappChain: boolean
  dposUser: Promise<DPOSUserV3> | null
  dpos3?: DPOS3
  isLoggedIn: boolean
  showSidebar: boolean
  connectedToMetamask: boolean
  web3: any
  currentMetamaskAddress: any
  history: null
  withdrawLimit: number
  validators: any[]
  status: string
  walletType: any
  selectedAccount: any
  metamaskDisabled: boolean
  showLoadingSpinner: boolean
  showSignWalletModal: boolean
  showAlreadyMappedModal: boolean
  mappingSuccess: boolean
  gatewayBusy: boolean
  userBalance: UserBalance
  rewardsResults: any
  timeUntilElectionCycle: any
  // timestamp millis
  nextElectionTime: number
  validatorFields: any[]
  prohibitedNodes: string[]
  latestBlockNumber?: number
  cachedEvents: any[]
  dappChainEventUrl: string
  historyPromise: Promise<any> | null
  dappChainEvents: any[]
  states: string[]
  delegations: any[]
  dashboardPrivateKey: string
  dashboardAddress: string
  analyticsEndpoint: string
  client: Client | null
  mapper: AddressMapper | null
  analyticsData: any
  showDepositForm: boolean
  showDepositApproved: boolean
  showDepositConfirmed: boolean
  pendingTx: any | null
  mappingError?: any
  cachedGatewayEvents?
  selectedLedgerPath?
  account: any
  localAddress: any
  count: 0
  chainUrls: any
  networkId: string
  currentChain: any
  dAppChainClient: Client | null
  metamaskStatus?: any
  metamaskError?: any
  withdrewSignature: string
}

// export interface DappchainState {
//   web3?: any
//   account: any
//   localAddress: any
//   count: 0
//   chainUrls: any
//   networkId: string
//   currentChain: any
//   dAppChainClient: Client | null
//   mappingError?: any
//   metamaskStatus?: any
//   metamaskError?: any
//   validators: any[]
// }

export interface DashboardEnvs {
  [netwotkId: string]: {
    dappchainEndpoint: string
    mainnetEndpoint: string
    chainId: string
    gatewayAddress: string,
  }
}

export interface Funds {
  symbol: string
  weiAmount: BN
}

export interface Transfer extends Funds {
  /**
   * destination or spender address
   */
  to: string
  toName?: string
}
