import { DPOSState } from "./types"
import BN from "bn.js"
import { DPOS3 } from "loom-js/dist/contracts"

export function setContract(state: DPOSState, contract: DPOS3) {
    state.contract = contract
}

export function setElectionTime(state: DPOSState, electionTime: Date) {
    state.electionTime = electionTime
    state.loading.electionTime = false
}

export function setValidators(state: DPOSState, validators: any[]) {
    state.validators = validators
    state.loading.validators = false
}

export function setDelegations(state: DPOSState, delegations: any[]) {
    state.delegations = delegations
    state.loading.delegations = false
}

export function setRewards(state: DPOSState, rewards: string) {
    state.rewards = rewards
    state.loading.rewards = false
}

