import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { UserDeployerState } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import { WhiteListState, DeployerAddress } from "./types"
import { Address } from "loom-js";

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
