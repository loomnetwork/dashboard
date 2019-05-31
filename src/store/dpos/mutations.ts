import { DPOSState } from "./types"
import BN from "bn.js"
import { DPOS3 } from "loom-js/dist/contracts"

export function setElectionTime(state: DPOSState, electionTime: Date) {
    state.electionTime = electionTime
    state.loading.electionTime = false
}

export function setRewards(state: DPOSState, rewards: BN) {
    state.rewards = rewards
    state.loading.rewards = false
}

