import { GatewayState } from "./types"

export function setShowDepositForm(state: GatewayState, payload: boolean) {
  state.showDepositForm = payload
}
