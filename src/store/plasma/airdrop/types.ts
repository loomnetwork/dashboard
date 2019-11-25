import { HasPlasmaState } from "../types"
import { Airdrop } from "@/store/plasma/airdrop/web3-contracts/Airdrop"
import { BareActionContext } from "vuex-typex"

export interface HasAirdropState extends HasPlasmaState {
  assets: AirdropState
}

export interface AirdropState {
  airdropContract: Airdrop | null
}

// helper/shorthand for plasma module action context
export declare type AirdropContext = BareActionContext<
  AirdropState,
  HasAirdropState
>
