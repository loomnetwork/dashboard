/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"
import { GatewayState, HasGatewayState, ActionContext } from "./types"
import * as Mapper from "./mapper"
import * as PlasmaGateways from "./plasma"
import * as EthereumGateways from "./ethereum"

const log = debug("dash.gateway")

function initialState(): GatewayState {
  return {
    mapping: null,
    withdrawalReceipts: {
      eth: null,
      loom: null,
    },
    pendingTransactions: [],
  }
}

const builder = getStoreBuilder<HasGatewayState>().module(
  "gateway",
  initialState(),
)
const stateGetter = builder.state()

export const gatewayModule = {
  get state() {
    return stateGetter()
  },

  // gateway
  ethereumDeposit: builder.dispatch(EthereumGateways.deposit),
  ethereumWithdraw: builder.dispatch(EthereumGateways.withdraw),

  plasmaWithdraw: builder.dispatch(PlasmaGateways.withdraw),
  refreshPendingReceipt: builder.dispatch(PlasmaGateways.refreshPendingReceipt),
  pollReceipt: builder.dispatch(PlasmaGateways.pollReceipt),

  // mapper
  loadMapping: builder.dispatch(Mapper.loadMapping),
  createMapping: builder.dispatch(Mapper.createMapping),
}
