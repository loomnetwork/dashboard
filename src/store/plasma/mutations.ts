import { PlasmaState } from "../plasma/types"
import Contract, {} from "web3/eth/contract"

export function setTokenSelected(state: PlasmaState, payload: string) {
    state.tokenSelected = payload
    console.log(state.tokenSelected)
}