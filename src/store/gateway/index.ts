/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"

import { Address, LocalAddress } from "loom-js"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"

import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"

import { GatewayState, HasGatewayState } from "./types"

import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import * as mutations from "./mutations"

declare type ActionContext = BareActionContext<GatewayState, HasGatewayState>

const initialState: GatewayState = {
    mapping: null,
    pendingReceipt: null,
    pendingTransaction: null,
    unclaimedTokens: [],
}

const builder = getStoreBuilder<HasGatewayState>().module("ethGateway", initialState)
const stateGetter = builder.state()

export const gatewayModule = {

    get state() { return stateGetter() },

    setMapping: builder.commit(mutations.setMapping),
    setPendingReceipt: builder.commit(mutations.setPendingReceipt),
    setPendingTx: builder.commit(mutations.setPendingTx),
    setUnclaimedTokens: builder.commit(mutations.setUnclaimedTokens),

    deposit: builder.dispatch(deposit),
    plasmaWithdraw: builder.dispatch(plasmaWithdraw),
    ethereumWithdraw: builder.dispatch(ethereumWithdraw),
    checkPendingReceipt: builder.dispatch(checkPendingReceipt),

    checkMapping: builder.dispatch(checkMapping),
    createMapping: builder.dispatch(createMapping),

}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function deposit( context: ActionContext, funds: Funds) {
  return timer(2000).toPromise()
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function plasmaWithdraw( context: ActionContext, funds: Funds ) {
  return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function ethereumWithdraw(context: ActionContext, funds: Funds) {
  return timer(2000).toPromise()
}

export function checkPendingReceipt(context: ActionContext) {
  return timer(2000).toPromise()
}

function checkMapping(context: ActionContext, adddress: string) {
    return timer(2000).toPromise()
}

function createMapping(context: ActionContext) {
    return timer(2000).toPromise()
}
