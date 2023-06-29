/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"

import { getStoreBuilder } from "vuex-typex"
import { GatewayState, HasGatewayState } from "./types"
import * as Mapper from "./mapper"
import * as PlasmaGateways from "./plasma"
import * as EthereumGateways from "./ethereum"
import * as mutations from "./mutations"
import { ethereumModule } from "../ethereum"
import { ActionContext } from "./types"
import Axios from "axios"

const log = debug("dash.gateway")

function initialState(): GatewayState {
  return {
    chains: [],
    mapping: null,
    withdrawalReceipts: null,
    pendingTransactions: [],
    ethereumAllowances: [],
    showDepositForm: false,
    showWithdrawForm: false,
    transferRequest: {
      type: "",
      chain: "",
      token: "",
    },
    // TODO: neither withdrawStates nor withdrawStateIdx appear to be used, should probably remove them
    withdrawStates: [
      { text: "Checking for pre-existing receipts...", isComplete: false },
      { text: "Depositing to Basechain Gateway...", isComplete: false },
      { text: "Awaiting Oracle signature...", isComplete: false },
      { text: "Withdrawing to your Ethereum account...", isComplete: false },
    ],
    withdrawStateIdx: 0,
    maybeRelentlessUser: null,
    requireMapping: false,
    tokenContractLogsURL: "",
    ethereumMappings: {
      confirmed: [],
      pending: [],
    },
    binance: {
      gatewayAccount: "",
      fee: 0,
    },
    withdrawalLimit: false,
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

  checkIfPastWithdrawalEventExists: builder.read(checkIfPastWithdrawalEventExists),

  getTokenContractLogs: builder.dispatch(getTokenContractLogs),

  // gateway
  ethereumDeposit: builder.dispatch(EthereumGateways.ethereumDeposit),
  ethereumWithdraw: builder.dispatch(EthereumGateways.ethereumWithdraw),
  checkTxStatus: builder.dispatch(EthereumGateways.checkTxStatus),
  refreshEthereumHistory: builder.dispatch(EthereumGateways.refreshEthereumHistory),
  refreshAllowances: builder.dispatch(EthereumGateways.refreshAllowances),
  loadTokenMappings: builder.dispatch(PlasmaGateways.loadTokenMappings),
  plasmaWithdraw: builder.dispatch(PlasmaGateways.plasmaWithdraw),
  pollReceipt: PlasmaGateways.pollReceipt,
  refreshWithdrawalReceipt: builder.dispatch(PlasmaGateways.refreshWithdrawalReceipt),

  // binance
  binanceResubmitWithdrawal: builder.dispatch(PlasmaGateways.binanceResubmitWithdrawal),

  // mapper
  loadMapping: builder.dispatch(Mapper.loadMapping),
  createMapping: builder.dispatch(Mapper.createMapping),
  setMaybeRelentlessUser: builder.commit(mutations.setMaybeRelentlessUser),

  // helper
  generateNewId: Mapper.generateNewId,

  // mutations
  setConfig: builder.commit(mutations.setConfig),
  setShowDepositForm: builder.commit(mutations.setShowDepositForm),
  setTransferRequest: builder.commit(mutations.setTransferRequest),
  clearTransferRequest: builder.commit(mutations.clearTransferRequest),
  setShowWithdrawForm: builder.commit(mutations.setShowWithdrawForm),
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

async function checkIfPastWithdrawalEventExists() {
  await gatewayModule.refreshEthereumHistory()
  const history = ethereumModule.state.history
  const blockNumber = ethereumModule.state.blockNumber
  //  check if there is a withdrawal event in the history that has yet to expire
  // (block number is less then the current blocknumber + 15 confirmations)
  const notExpired = history.find((event) => {
    return (event.type === "TokenWithdrawn" && (event.blockNumber + 20) >= blockNumber)
  })
  const inLocalStorage = ethereumModule.state.userData.pendingWithdrawal
  if (notExpired!! || inLocalStorage) {
    return true
  }
  return false
}

async function getTokenContractLogs(context: ActionContext, payload: { contractAddress: string, page: number }) {
  let indexerUrl = context.state.tokenContractLogsURL.replace("{address}", payload.contractAddress)
  indexerUrl += `?page=${payload.page}`

  const response = await Axios.get(indexerUrl)
  return response.data
}
