import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import BN from "bn.js"
import { BareActionContext } from "vuex-typex"
import { PlasmaState, HasPlasmaState } from "./types"
import { TokenSymbol } from "../ethereum/types"

declare type ActionContext = BareActionContext<PlasmaState, HasPlasmaState>

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<TokenSymbol, ERC20> = new Map()

function getErc20Contract() {
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
export function approve(
    context: ActionContext,
    payload: {
        symbol: TokenSymbol,
        tokenAmount?: BN,
        to: string,
    },
) {
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
