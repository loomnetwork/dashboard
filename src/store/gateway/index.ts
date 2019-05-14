/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"

import { Address, LocalAddress } from "loom-js"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"

import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Transaction } from "ethers/utils"
import { DashboardState } from "@/types"

import * as actions from "./actions"
import { GatewayState, HasGatewayState } from "./types"
import { Store } from "vuex"

const initialState: GatewayState = {
    pendingReceipt: null,
    pendingTransaction: null,
}

const builder = getStoreBuilder<DashboardState>().module("gateway", initialState)
const stateGetter = builder.state()

export const gatewayModule = {

    get state() { return stateGetter() },

    deposit: builder.dispatch(actions.deposit),
    withdrawToGateway: builder.dispatch(actions.withdrawToGateway),
    withdrawFromGateway: builder.dispatch(actions.withdrawFromGateway),
    checkPendingReceipt: builder.dispatch(actions.checkPendingReceipt),

}

function gatewayModulePlugin(store: Store<HasGatewayState>) {

    store.watch(
        (state) => store.state.gateway.pendingReceipt,
        (value, old) => {
            console.log("pending receipt")
        },
    )
}
