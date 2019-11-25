import { AirdropDetail } from "../types"
import { Airdrop } from "./web3-contracts/Airdrop"
import { AirdropState } from "./types"

export function setAirdropContract(state: AirdropState, payload: Airdrop) {
  state.airdropContract = payload
}

export function setUsersAirdrops(state: AirdropState, payload: AirdropDetail[]) {
  state.usersAirdrops = payload
}
