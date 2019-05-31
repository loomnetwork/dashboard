import { PlasmaState, CardDetail, PackDetail } from "./types"
import { Contract } from "web3-eth-contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { UserDeployerState } from "loom-js/dist/proto/user_deployer_whitelist_pb"

export function setUserDeployerWhitelist(
  state: PlasmaState,
  payload: UserDeployerWhitelist,
) {
  state.userDeployerWhitelist = payload
}

export function setUserDeployersAddress(
  state: PlasmaState,
  payload: UserDeployerState[],
) {
  state.userDeployersAddress = payload
}

export function setTokenSelected(state: PlasmaState, payload: string) {
    state.tokenSelected = payload
    console.log(state.tokenSelected)
}