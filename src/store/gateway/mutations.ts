import { GatewayState, TransferRequest, GatewayConfig } from "./types"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

export function setConfig(state: GatewayState, config: GatewayConfig) {
  Object.assign(state, config)
}

export function setTransferRequest(state: GatewayState, payload: TransferRequest) {
  state.transferRequest = payload
}

export function clearTransferRequest(state: GatewayState) {
  state.transferRequest = {
    type: "",
    chain: "",
    token: "",
  }
}

export function setShowDepositForm(state: GatewayState, payload: boolean) {
  state.showDepositForm = payload
}

export function setShowDepositApproved(state: GatewayState, payload: boolean) {
  state.showDepositApproved = payload
}

export function setShowDepositConfirmed(state: GatewayState, payload: boolean) {
  state.showDepositConfirmed = payload
}

export function setShowWithdrawForm(state: GatewayState, payload: boolean) {
  state.showWithdrawForm = payload
}

export function setShowWithdrawProgress(state: GatewayState, payload: boolean) {
  state.showWithdrawProgress = payload
}

export function setPendingTransactions(state: GatewayState, payload: object) {
  state.pendingTransactions.push(payload)
}

export function clearPendingTransactions(state: GatewayState) {
  state.pendingTransactions = new Array()
}

export function setNewMappingAgree(state: GatewayState, payload: boolean) {
  state.newMappingAgree = payload
}

export function setWithdrawalReceipts(
  state: GatewayState,
  payload: IWithdrawalReceipt | null,
) {
  state.withdrawalReceipts = payload
}

export function incrementWithdrawStateIdx(state: GatewayState) {
  const maxLength = state.withdrawStates.length
  if (state.withdrawStateIdx < maxLength) {
    state.withdrawStateIdx = state.withdrawStateIdx + 1
  }
}

export function setWithdrawStateAsCompleted(state: GatewayState) {
  if (state.withdrawStateIdx >= 2) {
    // -1 to select the element before, and -1 for correct index
    const idx = state.withdrawStateIdx - 1 - 1
    state.withdrawStates[idx].isComplete = true
  }
}
