/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"
import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import { DPOSState, HasDPOSState } from "./types"

import * as mutations from "./mutations"
import BN from "bn.js"
import { IDelegation, ICandidate } from "loom-js/dist/contracts/dpos3"
import { state } from "../common"
import { Address } from "loom-js"
import { plasmaModule } from "../plasma"

const initialState: DPOSState = {
    contract: null,
    loading: {
        electionTime: false,
        validators: false,
        delegations: false,
        rewards: false,
    },
    electionTime: new Date(),
    validators: [],
    delegations: [],
    rewards: new BN(0),
}

const builder = getStoreBuilder<HasDPOSState>().module("dpos", initialState)
const stateGetter = builder.state()

const dposModule = {

    get state() { return stateGetter() },

    setContract: builder.commit(mutations.setContract),
    setElectionTime: builder.commit(mutations.setElectionTime),
    setValidators: builder.commit(mutations.setValidators),
    setDelegations: builder.commit(mutations.setDelegations),
    setRewards: builder.commit(mutations.setRewards),

    delegate: builder.dispatch(delegate),
    redelegate: builder.dispatch(redelegate),
    consolidate: builder.dispatch(consolidate),
    undelegate: builder.dispatch(undelegate),
    claimRewards: builder.dispatch(claimRewards),

    refreshElectionTime: builder.dispatch(refreshElectionTime),
    refreshValidators: builder.dispatch(refreshValidators),
    refreshDelegations: builder.dispatch(refreshDelegations),
    refreshRewards: builder.dispatch(refreshRewards),
}

// vuex module as a service
export { dposModule }

declare type ActionContext = BareActionContext<DPOSState, HasDPOSState>

// read/static

async function refreshElectionTime(context: ActionContext) {
    const contract = context.state.contract!
    const time: BN = contract.getTimeUntilElectionAsync()
    const date = Date.now() + (time.toNumber() * 1000)
    dposModule.setElectionTime(new Date(date))
}

async function refreshValidators(context: ActionContext) {
    const contract = context.state.contract!
    const candidates = await contract.getCandidatesAsync()
    const validators = await contract.getValidatorsAsync()
    const delegations = await contract.getAllDelegations()
    dposModule.setValidators(candidates)
}

async function refreshDelegations(context: ActionContext) {
    const contract = context.state.contract!
    const response = await contract.checkAllDelegationsAsync(plasmaModule.getAddress())
    dposModule.setDelegations(response!.delegationsArray)
    dposModule.setValidators([])
}

async function refreshRewards(context: ActionContext) {
    const contract = await context.state.contract!
    const response = await contract.checkAllDelegationsAsync(plasmaModule.getAddress())
    dposModule.setDelegations(response!.delegationsArray)
}

// write/[the bc word for it]

async function delegate(context: ActionContext, delegation: IDelegation) {
    await context.state.contract!.delegateAsync(delegation.validator, delegation.amount, delegation.lockTimeTier)
}

async function redelegate(context: ActionContext, delegation: IDelegation) {
    await context.state.contract!.redelegateAsync(
        delegation.validator,
        delegation.updateValidator!,
        delegation.updateAmount,
        delegation.index,
    )

}

async function consolidate(context: ActionContext, validator: ICandidate) {
    await context.state.contract!.consolidateDelegations(validator.address)

}

async function undelegate(context: ActionContext, delegation: IDelegation) {
    await context.state.contract!.unbondAsync(delegation.validator, delegation.updateAmount, delegation.index)
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
function claimRewards(context: ActionContext) {
    // filter delegations index = 0 amount > 0
    // for each
    // set message "claiming rewards from validator x"
    //
    return timer(2000).toPromise()
}
