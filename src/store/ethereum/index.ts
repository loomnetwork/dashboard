/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"

import { DashboardState } from "@/types";

import { EthereumState } from "./types";

import * as actions from "./actions"
import * as mutations from "./mutations"

const initialState:EthereumState = {
    provider: null,
    erc20Addresses: {
        loom: "",
        bnb: "",
        usdc: "",
    },
    balances: {
        eth: null,
        loom: null
    }
}

const builder = getStoreBuilder<DashboardState>().module("ethereum", initialState)
const stateGetter = builder.state()




export const ethereumModule = {

    get state() { return stateGetter() },

    updateBalance: builder.dispatch(actions.updateBalance),
    approve: builder.dispatch(actions.approve),
    transfer: builder.dispatch(actions.transfer),

    setBalance: builder.commit(mutations.setBalance)

}