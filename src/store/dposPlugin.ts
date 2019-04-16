import Debug from "debug"
import { fromEventPattern, Observable, combineLatest } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";
import { Store } from "vuex";
import { setTimeout } from "timers";

Debug.enable("dashboard.dpos.rx")

const debug = Debug("dashboard.dpos.rx")

export function dposStorePlugin(store: Store<any>) {

    // As soon as we have a dposUser getTimeUntilElectionsAsync
    store.watch(
        (state) => state.DappChain.dposUser,
        // we never set dpos3 to null. I assume...
        () => store.dispatch("DPOS/getTimeUntilElectionsAsync"),
    )

    // Whenever timeUntilElectionCycle is refreshed, 
    // refresh validators and user delegations
    // could also check unclaimedTokens, allowance...etc
    store.watch(
        (state) => state.DPOS.timeUntilElectionCycle,
        (time: string) => {
            // assuming string...
            const seconds = parseInt(time, 10)
            setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), seconds * 1000)
            debug("getting validators")
            store.dispatch("DappChain/getValidatorsAsync")
            debug("getting checkAllDelegations")
            store.dispatch("DPOS/checkAllDelegations")
        },
    )

    // On user delegation actions
    // refresh user delegations balance and stakes
    const delegationActions = [
        "DPOS/redelegateAsync",
        "DappChain/delegateAsync",
        "DappChain/undelegateAsync",
    ]
    store.subscribeAction({
        after(action) {
            if (delegationActions.find(a =>a === action.type)) {
                store.dispatch("DPOS/checkAllDelegations")
                store.dispatch("DappChain/getDappchainLoomBalance")
                // this might not be needed since checkAllDelegations
                // returns total
                store.dispatch("DappChain/getAccumulatedStakingAmount")
            }
        }
    })

    buildLoadHistoryTrigger(store)
    buildWithdrawLimitTrigger(store)
}



function observeState(store: Store<any>, stateGetter): Observable<any> {
    // init with noop
    // unwatchFn is the fn returned by vuex .watch()
    let off = () => { }
    const on = (handler) => {
        off = store.watch(stateGetter, (val) => handler(val))
    }
    return fromEventPattern(on, off)
}



function buildLoadHistoryTrigger(store) {
    debug("buildLoadHistoryTrigger")

    combineLatest(
        observeState(store, (state) => state.DPOS.web3),
        observeState(store, (state) => state.DappChain.GatewayInstance),
        observeState(store, (state) => state.DPOS.currentMetamaskAddress),
    )
        .subscribe(([web3, gatewayInstance, address]) => {
            debug("all 3 available", address)
            store.dispatch("DPOS/loadEthereumHistory", { web3, gatewayInstance, address })
        })
    // if loadEthereumHistory arguments (3) change only once per session, we should unsubscribe
}

function buildWithdrawLimitTrigger(store) {
    debug("buildWithdrawLimitTrigger")

    const d = observeState(store, (state) => state.DPOS.history)
        .pipe(
            filter(val => val instanceof Promise),
            // TODO should handle promise failure or the pipe explodes
            switchMap(promise => promise),
            tap(() => debug("history loaded")),
        )
        .subscribe((history) => {
            debug("history loaded", history);
            store.dispatch("DPOS/updateDailyWithdrawLimit", history)
        })
}
