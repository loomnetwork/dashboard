import { EthereumState } from "./types"

export function getUserData(state: EthereumState, key: string) {
  return state.userData[key]
}
