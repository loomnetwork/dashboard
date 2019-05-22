import { HasDPOSState } from "./types"
import { Store } from "vuex"
import { dposModule } from "."
import { plasmaModule } from "../plasma"

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

    store.watch(
        (s) => s.plasma.address,
        () => createContract(store),
        { immediate: true },
    )

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

    function scheduleElectionTimeCall() {
        const time = store.state.dpos.electionTime.getTime()
        const delay = Math.max(time - Date.now(), 10000)
        log("elections call in", delay / 1000)
        setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), delay)
    }

    function refreshDPoSState() {
        dposModule.refreshValidators()
        if (store.state.plasma.address) {
            refreshDPoSUserState()
        }
    }

    function refreshDPoSUserState() {
        plasmaModule.refreshBalance("loom")
        dposModule.refreshDelegations()
        dposModule.refreshRewards()
    }

    setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), 1000)
}

async function createContract(store: Store<HasDPOSState>) {
    const caller = await plasmaModule.getCallerAddress()
    const client = store.state.plasma.client
    store.state.dpos.contract = await  DPOS3.createAsync(client, caller)
}
