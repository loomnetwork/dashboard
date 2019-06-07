import { GatewayState } from "./types"
import { state } from "../common"

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