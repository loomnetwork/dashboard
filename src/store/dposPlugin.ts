import Debug from "debug"
import { fromEventPattern, Observable, combineLatest } from "rxjs";
import { filter, switchMap, tap, take } from "rxjs/operators";
import { Store } from "vuex";
import { setTimeout } from "timers";
import { DPOSUserV3 } from "loom-js";
import { ERC20Gateway_v2 } from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2";
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20";
import { DashboardState } from "@/types";
import { sleep } from '../utils'
import { ConsolidateDelegationsRequest } from "loom-js/dist/proto/dposv3_pb";

const debug = Debug("dashboard.dpos")

export function dposStorePlugin(store: Store<DashboardState>) {

    store.subscribeAction({
        async after(action) {
            if(action.type !== "DPOS/getTimeUntilElectionsAsync") {
                return
            }
            const seconds = parseInt(store.state.DPOS.timeUntilElectionCycle, 10)
            debug("timeUntilElectionCycle", seconds)
            // seconds is 0 => elections still running
            const electionIsRunning = seconds < 1
            store.commit("DPOS/setElectionIsRunning", electionIsRunning)
            if (electionIsRunning) {
                // while still runing poll with an interval of 15 seconds
                // do not refresh vvalidators and delegations
                return setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), 15 * 1000)
            }
            store.dispatch("DappChain/getValidatorsAsync")
            // delegator specific calls
            if (store.state.DappChain.dposUser) {
                store.dispatch("DPOS/checkAllDelegations")
                store.dispatch("DPOS/queryRewards")
            }
            debug("setTimeout seconds",Math.max(seconds,1) * 1000)
            setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), Math.max(seconds,1) * 1000)
        }
    })

    // When a user session starts
    // load account state
    observeState(store, (state) => state.DappChain.dposUser )
    .pipe(
        filter((user) => user != null), 
        switchMap((x) => x as Promise<DPOSUserV3>),
        take(1) // happens only once per session, so take one to remove watcher...
    )
    .subscribe((user:DPOSUserV3) => {
        // load user state
        store.dispatch("DPOS/checkAllDelegations")
        store.dispatch("DappChain/getDappchainLoomBalance")
        store.dispatch("DappChain/getMetamaskLoomBalance")
        store.dispatch("DPOS/queryRewards")
        store.dispatch("DPOS/fetchDappChainEvents")
        store.dispatch("DPOS/loadEthereumHistory")
        watchLoomEthBalance(user,store)
    })

    //
    // After user dpos actions, refresh plasma balance and stakes:
    const dposActions = [
        "DPOS/redelegateAsync",
        "DPOS/consolidateDelegations",
        "DappChain/delegateAsync",
        "DappChain/undelegateAsync",
        "DPOS/claimRewardsAsync",
    ]
    store.subscribeAction({
        after(action) {
            if (dposActions.find(a => a === action.type)) {
                store.dispatch("DPOS/checkAllDelegations")
                store.dispatch("DappChain/getDappchainLoomBalance")
                store.dispatch("DPOS/queryRewards")
                store.dispatch("DPOS/fetchDappChainEvents")
                store.dispatch("DPOS/loadEthereumHistory")
            }
        }
    })

    buildWithdrawLimitTrigger(store)
    listenToGatewayEvents(store)

    store.dispatch("DPOS/getTimeUntilElectionsAsync")

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
 * 
 * @param dposUser 
 * @param store 
 */
function watchLoomEthBalance(
    dposUser: DPOSUserV3,
    store: Store<any>
    ) {
    const contract = dposUser.ethereumLoom
    const addr = dposUser.ethAddress
    // out out filters
    const send = contract.filters.Transfer(addr, null, null)
    const receive = contract.filters.Transfer(null, addr, null)

    const updateEthLoomBalance = () => store.dispatch("DappChain/getMetamaskLoomBalance")

    contract.on(send, updateEthLoomBalance)
    contract.on(receive, updateEthLoomBalance)
}

/**
 * Once DappChain.dposUser is set in the state, 
 * listens to Approval and deposit confirmations on the loom contract ethereum side.
 * @param store 
 */
function listenToGatewayEvents(store) {

    observeState(store, (state) => state.DappChain.dposUser )
    // assuming only one DPOS session per page load
    .pipe(take(1), switchMap((x) => x as Promise<DPOSUserV3>))
    .subscribe((dposUser:DPOSUserV3) => {
        const loom = dposUser.ethereumLoom
        const gw = dposUser.ethereumGateway
        const account = dposUser.ethAddress
        listenToDepositApproval(account, gw, loom, store)
        listenToDeposit(account, gw, loom, store)
    })

}

function listenToDepositApproval(account, gw: ERC20Gateway_v2, loom: ERC20, store: Store<any>) {
    const filter = loom.filters.Approval(account, gw.address, null)
    loom.on(filter, (from, to, weiAmount) => {
        debug('approval ' + weiAmount.toString() + ' tokens from ' + from);
        store.commit("DPOS/setShowDepositForm", false)
        store.commit("DPOS/setShowDepositApproved", true)
        store.commit("DPOS/setShowDepositConfirmed", false)
        // empty pendingTx
        // todo: theoratically not necessary but test hash, we never know...
        store.commit("DPOS/setPendingTx", null)
    });
}
function listenToDeposit(account, gw: ERC20Gateway_v2, loom: ERC20, store: Store<any>) {
    const filter = loom.filters.Transfer(account, gw.address, null)
    loom.on(filter, (from, to, weiAmount) => {
        debug('transfer ' + weiAmount.toString() + ' tokens from ' + from + ' to ' + to);
        store.commit("DPOS/setShowDepositForm", false)
        store.commit("DPOS/setShowDepositApproved", false)
        store.commit("DPOS/setShowDepositConfirmed", true)
        store.commit("DPOS/setPendingTx", null)
    });
}
