import { GatewayState } from "./types"

export function setShowDepositForm(state: GatewayState, payload: boolean) {
  state.showDepositForm = payload
}

export function setShowDepositApproved(state: GatewayState, payload: boolean) {
  state.showDepositApproved = payload
}

export function setShowDepositConfirmed(state: GatewayState, payload: boolean) {
  state.showDepositConfirmed = payload
}
