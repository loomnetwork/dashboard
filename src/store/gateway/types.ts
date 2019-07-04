import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { BareActionContext } from "vuex-typex"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState, PlasmaSigner } from "../plasma/types"
import BN from "bn.js"
import { Contract, Address } from "loom-js"

export declare type ChainName = "ethereum" | "binance" | "tron"

// Gateway module depends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
  gateway: GatewayState
}

export interface GatewayConfig {
  multisig: boolean
  chains: string[]
  checkMarketplaceURL: string
}
/**
 * Gateway state
 */
export interface GatewayState extends GatewayConfig {
  mapping: IAddressMapping | null
  pendingTransactions: any[]
  withdrawalReceipts: IWithdrawalReceipt | WithdrawalReceipt | null
  showDepositForm: boolean
  showDepositApproved: boolean
  showDepositConfirmed: boolean
  showWithdrawForm: boolean
  showWithdrawProgress: boolean
  withdrawStates: WithdrawState[]
  withdrawStateIdx: number
  transferRequest: TransferRequest
  maybeRelentlessUser: boolean | null
}

export interface WithdrawalReceiptsV2 extends IWithdrawalReceipt {
  decodedSig: {
    valIndexes: Array<number | string>
    vs: Array<number | string>
    rs: Array<string | number[]>
    ss: Array<string | number[]>,
  }
}

export interface TransferRequest {
  type: string
  chain: string
  token: string
}

export interface WithdrawState {
  text: string
  isComplete: boolean
}

/**
 * shorhand for gateway vuex module action context
 */
export declare type ActionContext = BareActionContext<
  GatewayState,
  HasGatewayState
>

export interface PlasmaGatewayAdapter {
  token: string
  contract: Contract | any
  withdraw(amount: BN, recipient?: Address)
  withdrawalReceipt(): Promise<IWithdrawalReceipt | null>
}

export interface WithdrawalReceipt extends IWithdrawalReceipt {
  chain: string
  symbol: string
}
