/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"

import * as actions from "./actions"
import { PlasmaState, HasPlasmaState } from "./types"
import { Client } from "loom-js"
import BN from "bn.js"
import { createDefaultClient } from "loom-js/dist/helpers"
import { TokenSymbol } from "../ethereum/types"
import { noop } from "vue-class-component/lib/util"

const initialState: PlasmaState = {
    // not state but...
    client: null,
    balances: {
        [TokenSymbol.LOOM]: new BN("0"),
        [TokenSymbol.ETH]: new BN("0"),
        [TokenSymbol.BNB]: new BN("0"),
    },
}

const builder = getStoreBuilder<HasPlasmaState>().module("plasma", initialState)
const stateGetter = builder.state()

export const ethereumModule = {

    get state() { return stateGetter() },

    updateBalance: builder.dispatch(actions.updateBalance),
    approve: builder.dispatch(actions.approve),
    transfer: builder.dispatch(actions.transferTokens),

}

function createClient() {
    noop()
}
