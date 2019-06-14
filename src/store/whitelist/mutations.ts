import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { WhiteListState, DeployerAddress } from "./types"
import { Address } from "loom-js"
import { ITier } from 'loom-js/dist/contracts/user-deployer-whitelist';

export function setUserDeployerWhitelist(
  state: WhiteListState,
  payload: UserDeployerWhitelist,
) {
  state.userDeployerWhitelist = payload
}

export function setUserDeployersAddress(
  state: WhiteListState,
  payload: DeployerAddress[],
) {
  state.userDeployersAddress = payload
}

export function setWhiteListContractAddress(
  state: WhiteListState,
  payload: Address,
) {
  state.whiteListContractAddress = payload
}

export function setDefaultTiers(
  state: WhiteListState,
  payload: ITier[]) {
    state.tiers = payload
}
