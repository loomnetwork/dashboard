import debug from "debug"
import { fromEventPattern, Observable } from "rxjs"
import { filter, switchMap, tap, take } from "rxjs/operators"
import { Store } from "vuex"
import { setTimeout } from "timers"
import { DPOSUserV3 } from "loom-js"
import { ERC20Gateway_v2 } from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { DashboardState } from "@/types"
import { DPOSTypedStore } from "./dpos-old"
import { noop } from "vue-class-component/lib/util"

const log = debug("dashboard.dpos")

debug.enable("dashboard.dpos")

export function dposStorePlugin(store: Store<DashboardState>) {

    return

    store.subscribeAction({
        after(action) {
            return
            if (action.type !== "DPOS/getTimeUntilElectionsAsync") {
                return
            }
            const seconds = parseInt(store.state.DPOS.timeUntilElectionCycle, 10)
            log("timeUntilElectionCycle", seconds)
            store.dispatch("DPOS/getValidatorsAsync")
            // delegator specific calls
            if (store.state.DPOS.dposUser) {
                store.dispatch("DPOS/checkAllDelegations")
                store.dispatch("DPOS/queryRewards")
            }
            log("setTimeout seconds", Math.max(seconds, 1) * 1000)
            setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), Math.max(seconds, 1) * 1000)
        },
    })

    // When a user session starts
    // load account state
    observeState(store, (state) => state.DPOS.dposUser )
    .pipe(
        filter((user) => user != null),
        switchMap((x) => x as Promise<DPOSUserV3>),
        take(1), // happens only once per session, so take one to remove watcher...
    )
    .subscribe((user: DPOSUserV3) => {
        // load user state
        store.dispatch("DPOS/checkAllDelegations")
        store.dispatch("DPOS/getDappchainLoomBalance")
        store.dispatch("DPOS/getMetamaskLoomBalance")
        store.dispatch("DPOS/queryRewards")
        store.dispatch("DPOS/fetchDappChainEvents")
        store.dispatch("DPOS/loadEthereumHistory")
        watchLoomEthBalance(user, store)
    })

    //
    // After user dpos actions, refresh plasma balance and stakes:
    const dposActions = [
        "DPOS/redelegateAsync",
        "DPOS/consolidateDelegations",
        "DPOS/delegateAsync",
        "DPOS/undelegateAsync",
        "DPOS/claimRewardsAsync",
    ]
    store.subscribeAction({
        after(action) {
            if (dposActions.find((a) => a === action.type)) {
                store.dispatch("DPOS/checkAllDelegations")
                store.dispatch("DPOS/getDappchainLoomBalance")
                store.dispatch("DPOS/queryRewards")
                store.dispatch("DPOS/fetchDappChainEvents")
                store.dispatch("DPOS/loadEthereumHistory")
            }
        },
    })

    buildWithdrawLimitTrigger(store)
    listenToGatewayEvents(store)

    setTimeout(() => store.dispatch("DPOS/getTimeUntilElectionsAsync"), 1000)
}

/**
 * helper to make vuex watchers observable
 * @param store
 * @param stateGetter
 */
function observeState<S, T>(store: Store<S>, stateGetter: (s: S) => T): Observable<any> {
    // init with noop
    // unwatchFn is the fn returned by vuex .watch()
    let off = noop
    const on = (handler) => {
        off = store.watch(stateGetter, (val) => handler(val))
    }
    return fromEventPattern(on, off)
}

function buildWithdrawLimitTrigger(store: Store<DashboardState>) {
    observeState(store, (state) => state.DPOS.history)
        .pipe(
            filter((val) => val instanceof Promise),
            // TODO should handle promise failure or the pipe explodes
            switchMap((promise) => promise),
            tap(() => log("history loaded")),
        )
        .subscribe((history) => {
            log("history loaded", history)
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
    store: Store<any>,
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
function listenToGatewayEvents(store: Store<DashboardState>) {

    observeState(store, (state) => state.DPOS.dposUser )
    // assuming only one DPOS session per page load
    .pipe(take(1), switchMap((x) => x as Promise<DPOSUserV3>))
    .subscribe((dposUser: DPOSUserV3) => {
        const loom = dposUser.ethereumLoom
        const gw = dposUser.ethereumGateway
        const account = dposUser.ethAddress
        listenToDepositApproval(account, gw, loom, store)
        listenToDeposit(account, gw, loom, store)
    })

}

function listenToDepositApproval(account, gw: ERC20Gateway_v2, loom: ERC20, store: Store<DashboardState>) {
    const approval = loom.filters.Approval(account, gw.address, null)
    loom.on(approval, (from, _, weiAmount) => {
        log("approval " + weiAmount.toString() + " tokens from " + from)
        DPOSTypedStore.setShowDepositForm(false)
        DPOSTypedStore.setShowDepositApproved(true)
        DPOSTypedStore.setShowDepositConfirmed(false)
        // empty pendingTx
        // todo: theoratically not necessary but test hash, we never know...
        DPOSTypedStore.setPendingTx(null)
    })
}
function listenToDeposit(account, gw: ERC20Gateway_v2, loom: ERC20, store: Store<any>) {
    const transfer = loom.filters.Transfer(account, gw.address, null)
    loom.on(transfer, (from, to, weiAmount) => {
        log("transfer " + weiAmount.toString() + " tokens from " + from + " to " + to)
        DPOSTypedStore.setShowDepositForm(false)
        DPOSTypedStore.setShowDepositApproved(false)
        DPOSTypedStore.setShowDepositConfirmed(false)
        DPOSTypedStore.setPendingTx(null)
    })
}
