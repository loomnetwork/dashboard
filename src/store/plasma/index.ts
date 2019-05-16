/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"

import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import { PlasmaState, HasPlasmaState, TransferRequest } from "./types"
import { Client } from "loom-js"
import BN from "bn.js"
import { createDefaultClient } from "loom-js/dist/helpers"
import { TokenSymbol } from "../ethereum/types"
import { noop } from "vue-class-component/lib/util"

const initialState: PlasmaState = {
    // not state but...
    client: createClient(),
    address: "",
    balances: {
        [TokenSymbol.LOOM]: new BN("0"),
        [TokenSymbol.ETH]: new BN("0"),
        [TokenSymbol.BNB]: new BN("0"),
    },
}

const builder = getStoreBuilder<HasPlasmaState>().module("plasma", initialState)
const stateGetter = builder.state()

export const plasmaModule = {

    get state() { return stateGetter() },

    updateBalance: builder.dispatch(updateBalance),
    approve: builder.dispatch(approveTransfer),
    transfer: builder.dispatch(transferTokens),

}

function createClient() {
    return new Client("default", "", "")
}

declare type ActionContext = BareActionContext<PlasmaState, HasPlasmaState>

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<TokenSymbol, ERC20> = new Map()

function getErc20Contract(symbol: string): ERC20 {
    // @ts-ignore
    return null
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function updateBalance(context: ActionContext, payload: {symbol: TokenSymbol, tokenAmount?: BN}) {
    return timer(2000).toPromise()
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approveTransfer(
    context: ActionContext,
    { symbol, tokenAmount, to }: TransferRequest,
) {

    const balance = context.state.balances[symbol]
    const weiAmount = tokenAmount
    if (weiAmount.gt(balance)) {
        throw new Error("approval.balance.low")
    }
    const contract: ERC20 = getErc20Contract(symbol)

    contract.functions.approve(to, weiAmount.toString())

    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transferTokens(
    context: ActionContext,
    payload: {
        symbol: string,
        tokenAmount: BN,
        to: string,
    },
) {
    return timer(2000).toPromise()
}

export function trasfertAsset(context: ActionContext,
                              payload: {
        symbol: string,
        to: string,
    },
) {
    return timer(2000).toPromise()
}
