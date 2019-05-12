import { DPOSState } from "./types"
import BN from "bn.js"


export function setValidators(state:DPOSState, validators:any[]) {
    state.validators = validators
    state.loading.rewards = false
}

export function setDelegations(state:DPOSState, delegations:any[]) {
    state.delegations = delegations
    state.loading.rewards = false
}

export function setRewards(state:DPOSState, rewards: string) {
    state.rewards = rewards
    state.loading.rewards = false
}

export function setElectionTime(state:DPOSState, electionTime:Date) {
    state.electionTime = electionTime
    state.loading.electionTime = false
}
