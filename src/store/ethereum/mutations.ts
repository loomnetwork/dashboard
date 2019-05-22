import { EthereumState, TokenSymbol } from "./types"
import BN from "bn.js"

export function setBalance(state: EthereumState, payload: {token: TokenSymbol, weiAmount: BN}) {
    state.balances[payload.token] = payload.weiAmount
}
