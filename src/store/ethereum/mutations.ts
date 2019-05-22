import { EthereumState, TokenSymbol } from "./types"
import BN from "bn.js"
import { Funds } from "@/types";

export function setBalance(state: EthereumState, funds: Funds) {
    state.balances[funds.symbol] = funds.tokenAmount
}
