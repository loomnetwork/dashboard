import { AirdropState } from "./types"

export function getAirdropInstance(state: AirdropState) {
  return state.airdropContract
}
