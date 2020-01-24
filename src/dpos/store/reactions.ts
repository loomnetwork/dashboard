/**
 * @module dashboard.dpos
 */

import { Store } from "vuex"
import { dposModule } from "."
import { plasmaModule } from "@/store/plasma"
import { contracts as plasmaTokenContracts } from "@/store/plasma/tokens"
import debug from "debug"
import { DPOS3 } from "loom-js/dist/contracts"
import { DashboardState } from "@/types"
const log = debug("dash.dpos")
//
// After user dpos actions, refresh plasma balance and stakes:
const DPOS_ACTIONS = [
  "dpos/redelegate",
  "dpos/consolidate",
  "dpos/delegate",
  "dpos/undelegate",
  "dpos/claimRewards",
]

let scheduledElectionCall: number = -1
let store: Store<DashboardState>

export function dposReactions(_store: Store<DashboardState>) {
  store = _store

  store.watch((s) => s.plasma.client, onClientReady)

  store.watch((s) => s.plasma.address, onAccountChange)

  store.subscribeAction({
    after(action) {
      if (action.type === "dpos/refreshElectionTime") {
        refreshDPoSState()
        scheduleElectionTimeCall()
      }
    },
  })

  store.subscribeAction({
    after(action) {
      if (
        store.state.plasma.address &&
        // DPOS_ACTIONS.find((a) => a === action.type)
        // TODO: link to chrome on windows bug
        /(redelegate|consolidate|delegate|undelegate|claimRewards)$/.test(action.type)
      ) {
        refreshDPoSUserState()
      }
    },
  })

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  window.addEventListener("visibilitychange", () => {
    if (document.hidden) return
    if (scheduledElectionCall > 0) {
      window.clearTimeout(scheduledElectionCall)
    }
    dposModule.refreshElectionTime()
  })
}

export const dposUtils = {
  onClientReady,
  onAccountChange,
  scheduleElectionTimeCall,
  refreshDPoSState,
  refreshDPoSUserState,
  createContract,
}

async function onClientReady() {
  log("onClientReady")
  if (scheduledElectionCall > 0) {
    window.clearTimeout(scheduledElectionCall)
  }
  await dposUtils.createContract(store)
  await dposModule.refreshElectionTime()
}

async function onAccountChange() {
  console.log("onAccountChange")
  log("onAccountChange")
  // recreate the contract with the right caller
  await dposUtils.createContract(store)
  await dposUtils.refreshDPoSUserState()
}

function scheduleElectionTimeCall() {
  const time = store.state.dpos.electionTime.getTime()
  // throttle to one call per 10 seconds
  const delay = Math.max(time - Date.now(), 10000)
  log("elections call in", delay / 1000)
  scheduledElectionCall = window.setTimeout(
    () => dposModule.refreshElectionTime(),
    delay,
  )
}

async function refreshDPoSState() {
  log("refreshDPoSState", store.state.plasma.address)
  await Promise.all([
    dposModule.refreshContractState(),
    dposModule.refreshValidators(),
  ])

  if (store.state.plasma.address) {
    await dposUtils.refreshDPoSUserState()
  }
}

function refreshDPoSUserState() {
  log("refreshDPoSUserState")
  if (plasmaTokenContracts.has("LOOM")) {
    plasmaModule.refreshBalance("LOOM")
  }
  dposModule.refreshDelegations()
}

async function createContract(_store: Store<DashboardState>) {
  const caller = await plasmaModule.getCallerAddress()
  const client = _store.state.plasma.client!
  _store.state.dpos.contract = await DPOS3.createAsync(client, caller)
  log("dpos3 created")
}
