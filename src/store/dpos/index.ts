/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"
import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import { DPOSState, HasDPOSState } from "./types"

import * as mutations from "./mutations"
import BN from "bn.js"
import { IDelegation } from "loom-js/dist/contracts/dpos3"

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

    refreshRewards: builder.dispatch(refreshRewards),

    refreshElectionTime: builder.dispatch(refreshElectionTime),
    refreshValidators: builder.dispatch(refreshValidators),

}

// vuex module as a service
export { dposModule }

declare type ActionContext = BareActionContext<DPOSState, HasDPOSState>

async function refreshElectionTime(context: ActionContext) {
    await timer(2000).toPromise()
    dposModule.setElectionTime(new Date(Date.now() + 60 + 1000))
}

async function refreshValidators(context: ActionContext) {
    await timer(2000).toPromise()
    dposModule.setValidators([])
}

function delegate(context: ActionContext, delegation: IDelegation) {
    return timer(2000).toPromise()
}

function redelegate(context: ActionContext, payload: IDelegation) {
    // playload .updateAmount .updateValidator .index
    return timer(2000).toPromise()
}

function consolidate(context: ActionContext, payload: {symbol: string, tokenAmount: BN, to: string}) {
    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
function undelegate(context: ActionContext, payload: IDelegation) {
    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
async function refreshRewards(context: ActionContext, payload: {symbol: string, tokenAmount: BN, to: string}) {
    await timer(2000).toPromise()
    dposModule.setRewards("0")
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
function claimRewards(context: ActionContext, payload: {symbol: string, tokenAmount: BN, to: string}) {
    return timer(2000).toPromise()
}
