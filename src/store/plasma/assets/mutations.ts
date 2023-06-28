import { CardDetail, PackDetail } from "../types"
import { Contract } from "web3-eth-contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { AssetsState } from "./types"

export function setPacksContract(
  state: AssetsState,
  payload: { name: string; contract: Contract },
) {
  state.packsContract[payload.name] = payload.contract
}

export function setCardContract(state: AssetsState, payload: MigratedZBGCard) {
  state.cardContract = payload
}

export function setCardBalance(state: AssetsState, payload: CardDetail[]) {
  state.cardBalance = payload
}

export function setPackBalance(state: AssetsState, payload: PackDetail[]) {
  state.packBalance = payload
}

export function setCardToTransferSelected(
  state: AssetsState,
  payload: CardDetail,
) {
  state.cardToTransferSelected = payload
}

export function setPackToTransferSelected(
  state: AssetsState,
  payload: { type: string; amount: number },
) {
  state.packToTransferSelected = payload
}

export function setAllCardsToTransferSelected(
  state: AssetsState,
  payload: {
    edition: string
    cards: CardDetail[]
    amount: number,
  },
) {
  state.allCardsToTransferSelected = payload
}
