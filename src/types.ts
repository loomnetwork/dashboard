import BN from "bn.js"
import { Client, DPOSUserV3, Address } from "loom-js"
import { AddressMapper, DPOS3 } from "loom-js/dist/contracts"
import { Contract } from "web3-eth-contract"
import { HasDPOSState, DPOSConfig } from "@/dpos/store/types"
import { EthereumConfig } from "./store/ethereum/types"
import { HasGatewayState, GatewayConfig } from "@/store/gateway/types"
import { PlasmaConfig } from "@/store/plasma/types"
import { HasWhiteListState } from "@/whitelist/store/types"
import { HasAssetsState } from "./store/plasma/assets/types"

export interface DashboardConfig {
  name: string
  coinDataUrl: string
  disabled: string[]
  // config for the gateway enabled chains
  chains: string[]
  plasma: PlasmaConfig
  ethereum: EthereumConfig
  dpos: DPOSConfig
  gateway: GatewayConfig,
  announcement: {
    validatorsPage: boolean,
  }
}

export interface DashboardState extends
  HasGatewayState,
  HasDPOSState,
  HasWhiteListState,
  HasAssetsState {
  env: string
  envs: DashboardConfig[]
  disabled: string[]
  chains: string[]
}

export interface Funds {
  chain: string
  symbol: string
  weiAmount: BN
  recepient?: Address
}

export interface Transfer extends Funds {
  /**
   * destination or spender address
   */
  to: string
  toName?: string
}
