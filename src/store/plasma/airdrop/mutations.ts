import { PlasmaState, CardDetail, PackDetail } from "../types"
import { Airdrop } from "./web3-contracts/Airdrop"
import { AirdropState } from "./types"

export function setAirdropContract(state: AirdropState, payload: Airdrop) {
  state.airdropContract = payload
}
