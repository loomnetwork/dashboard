/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"

import { DashboardState } from "@/types"

import { EthereumState } from "./types"

import * as mutations from "./mutations"

import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import BN from "bn.js"
import { BareActionContext } from "vuex-typex"
import { TransferRequest } from "../plasma/types"

const initialState: EthereumState = {
    provider: null,
    address: "",
    signer: null,
    erc20Addresses: {
        loom: "",
        bnb: "",
        usdc: "",
    },
    balances: {
        eth: null,
        loom: null,
    },
}

const builder = getStoreBuilder<DashboardState>().module("ethereum", initialState)
const stateGetter = builder.state()

// vuex typedd module
export const ethereumModule = {

    get state() { return stateGetter() },

    updateBalance: builder.dispatch(updateBalance),
    approve: builder.dispatch(approve),
    transfer: builder.dispatch(transfer),

    setBalance: builder.commit(mutations.setBalance),

}

declare type ActionContext = BareActionContext<EthereumState, DashboardState>

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<string, ERC20> = new Map()

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function updateBalance(context: ActionContext, symbol: string) {
    return timer(2000).toPromise()
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approve(context: ActionContext,  payload: TransferRequest) {
    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transfer(context: ActionContext, payload: TransferRequest) {
    return timer(2000).toPromise()
}

export function allowance(context: ActionContext, spender: string) {
    return timer(2000).toPromise().then(() => new BN("0"))
}
