import { CardDetail, PackDetail, HasPlasmaState } from "../types"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { Contract } from "web3-eth-contract"
import { BareActionContext } from "vuex-typex"

export interface HasAssetsState extends HasPlasmaState {
  assets: AssetsState
}

export interface AssetsState {
  packsContract: {
    [name: string]: Contract,
  }
  cardContract: MigratedZBGCard | null
  cardBalance: CardDetail[]
  packBalance: PackDetail[]
  cardToTransferSelected: CardDetail | null
  allCardsToTransferSelected: {
    edition: string
    cards: CardDetail[]
    amount: number,
  }

  packToTransferSelected: {
    type: string
    amount: number,
  }
}

// helper/shorthand for plasma module action context
export declare type AssetsContext = BareActionContext<
  AssetsState,
  HasAssetsState
>
