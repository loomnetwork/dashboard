import Debug from "debug"
import { fromEventPattern, Observable, combineLatest } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";

Debug.enable("dashboard.dpos.rx")

const debug = Debug("dashboard.dpos.rx")

export function dposStorePlugin(store) {

    buildLoadHistoryTrigger(store);
    buildWithdrawLimitTrigger(store);
}


function observeState(store, stateGetter): Observable<any> {
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
            tap(()=> debug("history loaded")),
        )
        .subscribe((history) => {
            debug("history loaded", history);
            store.dispatch("DPOS/updateDailyWithdrawLimit", history)
        })
}




