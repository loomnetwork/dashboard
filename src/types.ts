import BN from "bn.js"
import { Address } from "loom-js"
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
  chains: string[] // list of external chains to which gateways have been deployed
  plasma: PlasmaConfig
  ethereum: EthereumConfig
  binance?: EthereumConfig
  dpos: DPOSConfig
  gateway: GatewayConfig,
  announcement: {
    validatorsPage: boolean,
    popup: boolean,
    home: boolean,
  },
  features: {
    bscWallets: boolean, // show wallets that connect to BSC on the sign-in page
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
  activeConfig?: DashboardConfig
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
