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
import * as mutations from "./mutations"

const log = debug("dash.gateway")

function initialState(): GatewayState {
  return {
    mapping: null,
    withdrawalReceipts: {
      eth: null,
      loom: null,
    },
    pendingTransactions: [],
    showDepositForm: false,
    showDepositApproved: false,
    showDepositConfirmed: false,
    showWithdrawForm: false,
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
  ethereumDeposit: builder.dispatch(EthereumGateways.ethereumDeposit),
  ethereumWithdraw: builder.dispatch(EthereumGateways.ethereumWithdraw),

  plasmaWithdraw: builder.dispatch(PlasmaGateways.plasmaWithdraw),
  refreshPendingReceipt: builder.dispatch(PlasmaGateways.refreshPendingReceipt),
  pollReceipt: builder.dispatch(PlasmaGateways.pollReceipt),

  // mapper
  loadMapping: builder.dispatch(Mapper.loadMapping),
  createMapping: builder.dispatch(Mapper.createMapping),

  // mutations
  setShowDepositForm: builder.commit(mutations.setShowDepositForm),
  setShowDepositApproved: builder.commit(mutations.setShowDepositApproved),
  setShowDepositConfirmed: builder.commit(mutations.setShowDepositConfirmed),
  setShowWithdrawForm: builder.commit(mutations.setShowWithdrawForm),
  setPendingTransactions: builder.commit(mutations.setPendingTransactions),
  clearPendingTransactions: builder.commit(mutations.clearPendingTransactions),
}
