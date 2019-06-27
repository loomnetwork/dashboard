import { EthereumState } from "./types"
import BN from "bn.js"
import { Funds } from "@/types"

export function setBalance(state: EthereumState, funds: Funds) {
  state.balances[funds.symbol] = funds.weiAmount
}

export function setBlockNumber(state: EthereumState, payload: number) {
  state.blockNumber = payload
}

export function setLatestWithdrawalBlock(state: EthereumState, payload: number) {
  state.latestWithdrawalBlock = payload
}
