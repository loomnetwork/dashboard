import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { UserDeployerState } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import { BareActionContext } from "vuex-typex"
import { HasPlasmaState } from "../plasma/types"
import { Address } from "loom-js"
import { ITier } from 'loom-js/dist/contracts/user-deployer-whitelist';

export interface HasWhiteListState extends HasPlasmaState {
  whiteList: WhiteListState
}

export interface WhiteListState {
  userDeployerWhitelist: UserDeployerWhitelist | null
  userDeployersAddress: DeployerAddress[] | [],
  whiteListContractAddress: Address | null,
  tierIDs: number[],
  tiers: ITier[]
}

export interface DeployerAddress {
  address: Address
  hex: string,
  tier: number,
  base64: string,
  defaultFormat: "hex" | "base64"
}

export interface DeployerAddressResponse {
  address: Address,
  contracts: [],
  tierId: number,
}

// helper/shorthand for plasma module action context
export declare type WhiteListContext = BareActionContext<
  WhiteListState,
  HasWhiteListState
>
