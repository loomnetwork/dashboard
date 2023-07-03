import { ERC20__factory as ERC20Factory } from "loom-js/dist/mainnet-contracts/factories/ERC20__factory"
import { timer } from "rxjs"
import BN from "bn.js"
import { BareActionContext } from "vuex-typex"
import { EthereumState } from "./types"
import { DashboardState } from "@/types"

declare type ActionContext = BareActionContext<EthereumState, DashboardState>

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<string, ERC20Factory> = new Map()

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function updateBalance(
  context: ActionContext,
  payload: { symbol: string; tokenAmount?: BN },
) {
  return timer(2000).toPromise()
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approve(
  context: ActionContext,
  payload: { symbol: string; tokenAmount?: BN },
) {
  return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transfer(
  context: ActionContext,
  payload: { symbol: string; tokenAmount: BN; to: string },
) {
  return timer(2000).toPromise()
}
