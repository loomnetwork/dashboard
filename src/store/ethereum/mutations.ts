import { EthereumState } from "./types"
import BN from "bn.js"
import { Funds } from "@/types"

function fetchUserData(address: string) {
  return JSON.parse(localStorage.getItem(address) || "{}")
}

export function setBalance(state: EthereumState, funds: Funds) {
  state.balances[funds.symbol] = funds.weiAmount
}

export function setBlockNumber(state: EthereumState, payload: number) {
  state.blockNumber = payload
}

export function setLatestWithdrawalBlock(state: EthereumState, payload: number) {
  state.latestWithdrawalBlock = payload
}

export function setClaimedReceiptHasExpired(state: EthereumState, payload: boolean) {
  state.claimedReceiptHasExpired = payload
}

export function initUserData(state: EthereumState, address: string) {
  const tmp = new Object()
  const cache = fetchUserData(address)
  state.userData = Object.assign(tmp, cache)
}

export function setUserData(state: EthereumState, payload: {[key: string]: any}) {
  let cache = fetchUserData(state.address)
  cache = Object.assign(cache, payload)
  state.userData = cache
  localStorage.setItem(state.address, JSON.stringify(state.userData))
}

export function deleteUserData(state: EthereumState, key: string) {
  const cache = fetchUserData(state.address)
  if (cache[key]) delete cache[key]
  state.userData = cache
  localStorage.setItem(state.address, JSON.stringify(state.userData))
}

export function clearHistory(state: EthereumState) {
  state.history = []
}

export function setWalletNetworkId(state: EthereumState, payload: number) {
  console.log(`setWalletNetworkId - ${payload}`)
  state.walletNetworkId = payload
}
