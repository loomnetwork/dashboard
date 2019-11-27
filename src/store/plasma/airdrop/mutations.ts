import { Airdrop } from "./web3-contracts/Airdrop"
import { AirdropState, AirdropDetail } from "./types"

export function setAirdropContract(state: AirdropState, payload: Airdrop) {
  state.airdropContract = payload
}

export function setUsersAirdrops(state: AirdropState, payload: AirdropDetail[]) {
  state.usersAirdrops = payload
}
