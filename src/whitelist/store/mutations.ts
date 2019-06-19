import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { WhiteListState, DeployerAddress } from "./types"
import { ITier, IDeployedContract } from "loom-js/dist/contracts/user-deployer-whitelist"

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

export function setDefaultTiers(state: WhiteListState, payload: ITier[]) {
  state.tiers = payload
}

export function setDeployedContractAddress(
  state: WhiteListState,
  payload: {deployerAddress: string, deployedContractAddress: IDeployedContract[]},
) {
  state.deployedContractAddress[payload.deployerAddress] = payload.deployedContractAddress
}
