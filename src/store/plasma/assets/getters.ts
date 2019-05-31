import { AssetsState } from "./types"

export function getCardInstance(state: AssetsState) {
  return state.cardContract
}

export function getPacksInstance(state: AssetsState) {
  return state.packsContract
}
