import { HasDPOSState } from "./types"
import { Store } from "vuex"
import { dposModule } from "."
import { plasmaModule } from "@/store/plasma"

import debug from "debug"
import { DPOS3 } from "loom-js/dist/contracts"
const log = debug("dpos")
//
// After user dpos actions, refresh plasma balance and stakes:
const DPOS_ACTIONS = [
    "dpos/redelegate",
    "dpos/consolidate",
    "dpos/delegate",
    "dpos/undelegate",
    "dpos/claimRewards",
]
export function dposReactions(store: Store<HasDPOSState>) {

    let scheduledElectionCall: number = -1

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
                DPOS_ACTIONS.find((a) => a === action.type)
            ) {
                refreshDPoSUserState()
            }
        },
    })

    async function onClientReady() {
        await createContract(store)
        dposModule.refreshElectionTime()

    }

    async function onAccountChange() {
        // recreate the contract with the right caller
        await createContract(store)
        refreshDPoSUserState()
    }

    function scheduleElectionTimeCall() {
        const time = store.state.dpos.electionTime.getTime()
        const delay = Math.max(time - Date.now(), 10000)
        log("elections call in", delay / 1000)
        scheduledElectionCall = window.setTimeout(() => dposModule.refreshElectionTime(), delay)
    }

    function refreshDPoSState() {
        log("refreshDPoSState", store.state.plasma.address)
        dposModule.refreshValidators()
        if (store.state.plasma.address) {
            refreshDPoSUserState()
        }
    }

    function refreshDPoSUserState() {
        log("refreshDPoSUserState")
        plasmaModule.refreshBalance("loom")
        dposModule.refreshDelegations()
    }

    setTimeout(() => dposModule.refreshElectionTime(), 1000)

     // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
    window.addEventListener("visibilitychange", () => {
        if (document.hidden) return
        if (scheduledElectionCall > 0) {
            window.clearTimeout(scheduledElectionCall)
        }
        dposModule.refreshElectionTime()
    })
}

async function createContract(store: Store<HasDPOSState>) {
    const caller = await plasmaModule.getCallerAddress()
    const client = store.state.plasma.client
    store.state.dpos.contract = await  DPOS3.createAsync(client, caller)

}

