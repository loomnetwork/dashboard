import { AddressMapper, DPOS3 } from "loom-js/dist/contracts";
import { Client, DPOSUserV3 } from "loom-js";
import { HasGatewayState } from "./store/gateway/types";

export interface DashboardState extends HasGatewayState {
    DPOS:DposState
    DappChain:DappchainState
}

export interface DposState {
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
    userBalance: {
      isLoading: boolean,
      loomBalance: any,
      mainnetBalance: any,
      stakedAmount: any,
    }
    rewardsResults: any
    timeUntilElectionCycle: any
    // timestamp millis
    nextElectionTime: number
    validatorFields: any[]
    prohibitedNodes: string[]
    latestBlockNumber?: number
    cachedEvents: any[]
    dappChainEventUrl: string
    historyPromise: Promise<any>|null
    dappChainEvents: any[]
    states: string[]
    delegations: any[]
    dashboardPrivateKey: string
    dashboardAddress: string
    analyticsEndpoint: string
    client: Client|null
    mapper: AddressMapper|null
    analyticsData: any
    showDepositForm: boolean
    showDepositApproved: boolean
    showDepositConfirmed: boolean
    pendingTx: any|null
    mappingError?: any
    cachedGatewayEvents?
    selectedLedgerPath?
  }

 export  interface DappchainState {
    web3?: any,
    account: any,
    localAddress: any,
    count: 0,
    chainUrls: any,
    networkId: string,
    currentChain: any,
    dAppChainClient: any,
    GatewayInstance: any,
    dposUser?: DPOSUserV3,
    dpos3?: DPOS3,
    mappingStatus?: any,
    mappingError?: any,
    metamaskStatus?: any,
    metamaskError?: any,
    isConnectedToDappChain: boolean,
    showSigningAlert: boolean,
    validators: any[],
  }
  