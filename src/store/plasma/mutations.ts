import { PlasmaState } from "./types"
import BN from "bn.js"

export function setBalance(
    state: PlasmaState,
    payload: {
        symbol: string,
        balance: BN,
    },
) {
    state.coins[payload.symbol].balance = payload.balance
    state.coins[payload.symbol].loading = false
}
