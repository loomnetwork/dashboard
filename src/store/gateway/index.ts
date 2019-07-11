/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"
import { GatewayState, HasGatewayState } from "./types"
import * as Mapper from "./mapper"
import * as PlasmaGateways from "./plasma"
import * as EthereumGateways from "./ethereum"
import * as mutations from "./mutations"
import { ethereumModule } from "../ethereum"

const log = debug("dash.gateway")

function initialState(): GatewayState {
  return {
    multisig: false,
    chains: [],
    mapping: null,
    withdrawalReceipts: null,
    pendingTransactions: [],
    showDepositForm: false,
    showDepositApproved: false,
    showDepositConfirmed: false,
    showWithdrawForm: false,
    showWithdrawProgress: false,
    transferRequest: {
      type: "",
      chain: "",
      token: "",
    },
    withdrawStates: [
      { text: "Checking for pre-existing receipts...", isComplete: false },
      { text: "Depositing to Plasmachain Gateway...", isComplete: false },
      { text: "Awaiting Oracle signature...", isComplete: false },
      { text: "Withdrawing to your Ethereum account...", isComplete: false },
    ],
    withdrawStateIdx: 0,
    maybeRelentlessUser: null,
    checkMarketplaceURL: "",
    gateways: {
      ethereum: null,
      plasma: null,
    },
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

  withdrawalInProgress: builder.read(withdrawalInProgress),
  checkIfPastWithdrawalEventExists: builder.read(checkIfPastWithdrawalEventExists),

  // gateway
  initEthereumGateways: builder.dispatch(EthereumGateways.initEthereumGateways),
  ethereumDeposit: builder.dispatch(EthereumGateways.ethereumDeposit),
  ethereumWithdraw: builder.dispatch(EthereumGateways.ethereumWithdraw),
  refreshEthereumHistory: builder.dispatch(EthereumGateways.refreshEthereumHistory),

  plasmaWithdraw: builder.dispatch(PlasmaGateways.plasmaWithdraw),
  pollReceipt: PlasmaGateways.pollReceipt,

  // mapper
  loadMapping: builder.dispatch(Mapper.loadMapping),
  createMapping: builder.dispatch(Mapper.createMapping),
  setMaybeRelentlessUser: builder.commit(mutations.setMaybeRelentlessUser),
  checkRelentlessUser: builder.dispatch(Mapper.checkRelentlessUser),

  // mutations
  setConfig: builder.commit(mutations.setConfig),
  setShowDepositForm: builder.commit(mutations.setShowDepositForm),
  setTransferRequest: builder.commit(mutations.setTransferRequest),
  clearTransferRequest: builder.commit(mutations.clearTransferRequest),
  setShowDepositApproved: builder.commit(mutations.setShowDepositApproved),
  setShowDepositConfirmed: builder.commit(mutations.setShowDepositConfirmed),
  setShowWithdrawForm: builder.commit(mutations.setShowWithdrawForm),
  setShowWithdrawProgress: builder.commit(mutations.setShowWithdrawProgress),
  setPendingTransactions: builder.commit(mutations.setPendingTransactions),
  clearPendingTransactions: builder.commit(mutations.clearPendingTransactions),
  setWithdrawalReceipts: builder.commit(mutations.setWithdrawalReceipts),
  incrementWithdrawStateIdx: builder.commit(
    mutations.incrementWithdrawStateIdx,
  ),
  setWithdrawStateAsCompleted: builder.commit(
    mutations.setWithdrawStateAsCompleted,
  ),
}

function withdrawalInProgress() {
  const withdrawalBlock = JSON.parse(
    localStorage.getItem("latestWithdrawalBlock") || "null",
  )
  if (!withdrawalBlock) return false
  // 10 block confirmations + 5 for processing
  return ethereumModule.state.blockNumber - 15 > withdrawalBlock ? false : true
}

async function checkIfPastWithdrawalEventExists() {
  await gatewayModule.refreshEthereumHistory()
  return ethereumModule.state.history.find((event) => {
    return (event.event === "TokenWithdrawn" &&
    (event.blockNumber + 15) >= ethereumModule.state.blockNumber)
  }) ? true : JSON.parse(
    localStorage.getItem("pendingWithdrawal") || "false",
  ) ? true : false
}
