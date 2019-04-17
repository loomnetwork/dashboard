import Debug from "debug"
import { fromEventPattern, Observable, combineLatest, pipe } from "rxjs";
import { filter, switchMap, tap, map, take } from "rxjs/operators";
import { Store } from "vuex";
import { setTimeout } from "timers";
import { DPOSUser } from "loom-js";
import { Contract } from "ethers";

const debug = Debug("dashboard.dpos")

export function dposStorePlugin(store: Store<any>) {

    // As soon as we have a dposUser getTimeUntilElectionsAsync
    observeState(store,(state) => state.DappChain.dposUser)
    .pipe(take(1))
    .subscribe(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"))

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
            debug("getting listDelegatorDelegations")
            store.dispatch("DPOS/listDelegatorDelegations")
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
            if (delegationActions.find(a => a === action.type)) {
                store.dispatch("DPOS/listDelegatorDelegations")
                store.dispatch("DappChain/getDappchainLoomBalance")
                // this might not be needed since listDelegatorDelegations
                // returns total
                store.dispatch("DappChain/getAccumulatedStakingAmount")
            }
        }
    })

    buildLoadHistoryTrigger(store)
    buildWithdrawLimitTrigger(store)
    listenToGatewayEvents(store)
}


/**
 * helper to make vuex watchers observable
 * @param store 
 * @param stateGetter 
 */
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
    combineLatest(
        observeState(store, (state) => state.DPOS.web3),
        observeState(store, (state) => state.DappChain.GatewayInstance),
        observeState(store, (state) => state.DPOS.currentMetamaskAddress),
    ).pipe(take(1))
        .subscribe(([web3, gatewayInstance, address]) => {
            debug("all 3 available", address)
            store.dispatch("DPOS/loadEthereumHistory", { web3, gatewayInstance, address })
        })
    // if loadEthereumHistory arguments (3) change only once per session, we should unsubscribe
}

function buildWithdrawLimitTrigger(store) {
    observeState(store, (state) => state.DPOS.history)
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


/**
 * Once DappChain.dposUser, DappChain.GatewayInstance amd DPOS.currentMetamaskAddress
 * are set in the state, 
 * listens to Approval events on the loom contract ethereum side,
 * when an approval is confirmed triggers notifies the state
 * @param store 
 */
function listenToGatewayEvents(store) {

    observeState(store, (state) => state.DappChain.dposUser)
    // assuming only one DPOS session per page load
    .pipe(take(1))
    .subscribe((dposUser:DPOSUser) => {
        const loom =  dposUser.ethereumLoom
        const gw = dposUser.ethereumGateway
        const account = dposUser.ethAddress
        listenToDepositApproval(account, gw, loom, store)
        listenToDeposit(account, gw, loom, store)
    })

}

function listenToDepositApproval(account, gw: Contract, loom: Contract, store: Store<any>) {
    const filter = loom.filters.Approval(account, gw.address)
    loom.on(filter, (from, to, weiAmount) => {
        console.log('approval ' + weiAmount.toString() + ' tokens from ' + from);
        store.commit("DPOS/setShowDepositApproved", true)
        // empty pendingTx
        // todo: theoratically not necessary but test hash, we never know...
        store.commit("DPOS/setPendingTx", null)
    });
}
function listenToDeposit(account, gw: Contract, loom: Contract, store: Store<any>) {
    const filter = loom.filters.Transfer(account, gw.address)
    loom.on(filter, (from, to, weiAmount) => {
        console.log('transfer ' + weiAmount.toString() + ' tokens from ' + from + ' to ' + to);
        store.commit("DPOS/setShowDepositApproved", false)
        store.commit("DPOS/setShowDepositConfirmed", true)
        store.commit("DPOS/setPendingTx", null)
    });
}
