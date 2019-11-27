import { HasPlasmaState } from "../types"
import { Airdrop } from "@/store/plasma/airdrop/web3-contracts/Airdrop"
import { BareActionContext } from "vuex-typex"

export interface HasAirdropState extends HasPlasmaState {
  airdrop: AirdropState
}

export interface AirdropState {
  airdropContract: Airdrop | null,
  usersAirdrops: AirdropDetail[]
}
export interface AirdropDetail {
  airdropID: number,
  receiver: string,
  tokenAddress: string,
  airdropAmount: number,
  timelock: number,
  isWithdrew: boolean,
}

// helper/shorthand for plasma module action context
export declare type AirdropContext = BareActionContext<
  AirdropState,
  HasAirdropState
>
