import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { BareActionContext } from "vuex-typex"
import { HasPlasmaState } from "@/store/plasma/types"
import { Address } from "loom-js"
import { ITier } from "loom-js/dist/contracts/user-deployer-whitelist"

export interface HasWhiteListState extends HasPlasmaState {
  whiteList: WhiteListState
}

export interface WhiteListState {
  userDeployerWhitelist: UserDeployerWhitelist | null
  userDeployersAddress: DeployerAddress[] | []
  tierIDs: number[]
  tiers: ITier[]
  seed: {
    mnemonic: string
    publicAddress: string,
  }
  deployedContractAddress: DeployedContractAddress
}

export interface DeployedContractAddress {
  [deployerAddress: string]: string[]
}
export interface DeployerAddress {
  address: Address
  hex: string
  tier: number
  base64: string
}

export interface DeployerAddressResponse {
  address: Address
  contracts: []
  tierId: number
}

// helper/shorthand for plasma module action context
export declare type WhiteListContext = BareActionContext<
  WhiteListState,
  HasWhiteListState
>
