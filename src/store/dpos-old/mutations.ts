import { DposState, UserBalance } from "@/types"
import { Client, DPOSUserV3, Address } from "loom-js"
import { AddressMapper } from "loom-js/dist/contracts"
import Web3 from "web3"

export function setDappChainConnected(state: DposState, payload: boolean) {
  state.isConnectedToDappChain = payload
}

export function setConnectedToMetamask(state: DposState, payload: boolean) {
  state.connectedToMetamask = payload
}
export function setWeb3(state: DposState, payload: Web3) {
  state.web3 = payload
}
export function setUserBalance(state: DposState, payload: UserBalance) {
  state.userBalance = payload
}
export function setValidators(state: DposState, payload: any[]) {
  state.validators = payload
}
export function setCurrentMetamaskAddress(state: DposState, payload: string) {
  state.currentMetamaskAddress = payload
}
export function setStatus(state: DposState, payload: string) {
  state.status = payload
}
export function setMetamaskDisabled(state: DposState, payload: boolean) {
  state.metamaskDisabled = payload
}
export function setAlreadyMappedModal(state: DposState, payload: boolean) {
  state.showAlreadyMappedModal = payload
}
export function setMappingSuccess(state: DposState, payload: boolean) {
  state.mappingSuccess = payload
}
export function setRewardsResults(state: DposState, payload: string) {
  state.rewardsResults = payload
}
export function setTimeUntilElectionCycle(state: DposState, payload: string|number) {
  state.timeUntilElectionCycle = payload
}
export function setNextElectionTime(state: DposState, millis: number) {
  state.nextElectionTime = millis
}
export function setWalletType(state: DposState, payload: string) {
  state.walletType = payload
  sessionStorage.setItem("walletType", payload)
  sessionStorage.removeItem("selectedLedgerPath")
}
export function setSelectedAccount(state: DposState, payload: string) {
  state.selectedAccount = payload
}
export function setLatesBlockNumber(state: DposState, payload: number) {
  state.latestBlockNumber = payload
  sessionStorage.setItem("latestBlockNumber", JSON.stringify(payload))
}
export function setCachedEvents(state: DposState, payload: any[]) {
  state.cachedGatewayEvents = payload
  sessionStorage.setItem("cachedEvents", JSON.stringify(payload))
}
export function setSelectedLedgerPath(state: DposState, payload: string) {
  state.selectedLedgerPath = payload
  sessionStorage.removeItem("selectedLedgerPath")
}
export function setGatewayBusy(state: DposState, busy: boolean) {
  state.gatewayBusy = busy
}
export function setHistoryPromise(state: DposState, payload: Promise<any>) {
  state.historyPromise = payload
}
export function setDappChainEvents(state: DposState, payload: any[]) {
  state.dappChainEvents = payload
}
export function setClient(state: DposState, payload: Client) {
  state.client = payload
}
export function setMapper(state: DposState, payload: AddressMapper) {
  state.mapper = payload
}
export function setAnalyticsData(state: DposState, payload: object) {
  state.analyticsData = payload
}
export function setDelegations(state: DposState, payload: any[]) {
  state.delegations = payload
}
export function setShowDepositForm(state: DposState, playload: boolean) {
  state.showDepositForm = playload
}
export function setShowDepositApproved(state: DposState, playload: boolean) {
  state.showDepositApproved = playload
}
export function setShowDepositConfirmed(state: DposState, playload: boolean) {
  state.showDepositConfirmed = playload
}
export function setPendingTx(state: DposState, info: {type: string, hash: string}|null) {
  state.pendingTx = info
}

export function setDPOSUserV3(state: DposState, payload: Promise<DPOSUserV3>|null) {
  state.dposUser = payload
}

export function setMappingStatus(state: DposState, payload: string) {
  state.mappingStatus = payload
}
export function setMappingError(state: DposState, payload: Error|null) {
  state.mappingError = payload
}

export function setIsLoggedIn(state: DposState, payload: boolean) {
  state.isLoggedIn = payload
}
export function setShowSidebar(state: DposState, payload: boolean) {
  state.showSidebar = payload
}

export function setShowSigningAlert(state: DposState, payload: boolean) {
  state.showSigningAlert = payload
}

export function setSignWalletModal(state: DposState, payload: boolean) {
  state.showSignWalletModal = payload
}

export function updateState(
    state: DposState,
    payload: {account: string, dAppChainClient: Client, localAddress: Address},
) {
  state.account = payload.account
  state.dAppChainClient = payload.dAppChainClient
  state.localAddress = payload.localAddress
}

export function setMetamaskStatus(state: DposState, payload: string) {
  state.metamaskStatus = payload
}
export function setMetamaskError(state: DposState, payload: Error|any) {
  state.metamaskError = payload
}

export function setWithdrewSignature(state: DposState, payload: string) {
  if (!payload) {
    sessionStorage.removeItem("withdrewSignature")
  } else {
    sessionStorage.setItem("withdrewSignature", JSON.stringify(payload))
  }
  state.withdrewSignature = payload
}
export function setWithdrewOn(state: DposState, timestamp: number) {
  localStorage.setItem("lastWithdrawTime", JSON.stringify(timestamp))
}

export function setNetworkId(state: DposState, payload: string) {
  state.networkId = payload
  sessionStorage.setItem("networkId", payload)
}
export function setCurrentChain(state: DposState, payload: string) {
  state.currentChain = payload
}
