import Debug from "debug"
import { fromEventPattern, Observable, combineLatest } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";
import { Store } from "vuex";
import { setTimeout } from "timers";
import { DPOSUserV3 } from "loom-js";

Debug.enable("dashboard.dpos")

const debug = Debug("dashboard.dpos")
const delegationActions = [
    "DPOS/redelegateAsync",
    "DappChain/delegateAsync",
    "DappChain/undelegateAsync",
]

export function dposStorePlugin(store: Store<any>) {

    // As soon as we have a dposUser getTimeUntilElectionsAsync
    store.watch(
        (state) => state.DappChain.dposUser,
        // we never set dpos3 to null. I assume...
        async (dposUser) => {
            store.dispatch("DPOS/getTimeUntilElectionsAsync")

            // get initiale balances
            let loomBalance = await store.dispatch("DappChain/getDappchainLoomBalance")
            let mainnetBalance = await store.dispatch("DappChain/getMetamaskLoomBalance")
            console.log(loomBalance.toString())
            const ub = Object.assign(store.state.DPOS.userBalance, {
                loomBalance,
                mainnetBalance,
            })
            store.commit("DPOS/setUserBalance", ub)
            // listen on loom contract and update loom on ethereum balance
            watchLoomEthBalance(await dposUser, store)
            watchLoomPlasmaBalance(await dposUser, store)

        },
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
    // refresh user delegations and stakes
    // todo refresh rewards also
    store.subscribeAction({
        after(action) {
            if (delegationActions.find(a =>a === action.type)) {
                store.dispatch("DPOS/checkAllDelegations")
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

    const updateEthLoomBalance = async() => {
        const mainnetBalance = await store.dispatch("DappChain/getDappchainLoomBalance")
        const ub = Object.assign(
            store.state.DPOS.userBalance, 
            { mainnetBalance,}
        )
        store.commit("DPOS/setUserBalance", ub)
    }
    contract.on(send, updateEthLoomBalance)
    contract.on(receive, updateEthLoomBalance)
}

/**
 * updates balances after delegation actions
 * plus Arbitrary interval of 30 secs (to cover deposits)
 * @param dposUser 
 * @param store 
 */
function watchLoomPlasmaBalance(
    dposUser: DPOSUserV3,
    store: Store<any>
) {
    const updateBalance = async() => {
        const loomBalance = await store.dispatch("DappChain/getDappchainLoomBalance")
        const ub = Object.assign(
            store.state.DPOS.userBalance, 
            { loomBalance }
        )
        store.commit("DPOS/setUserBalance", ub)
    }
    // We have hooks for delegation operations. We can use those to get the change right away
    store.subscribeAction({
        after(action) {
            if (delegationActions.find(a =>a === action.type)) {
                updateBalance()
            }
        }
    })

    // Covering withdraw: hacky, but state.gatewayBusy is a hint some transfer has taken place
    // so refresh balance when  busy set to false (post operation)...
    store.watch(
        (state) => state.DPOS.gatewayBusy,
        (busy) => {
            if (busy === false) {
                updateBalance()
            }
        }
    )

    // for deposits we have no way to be notified it seems. Covering with an interval
    setInterval(updateBalance,10)
}