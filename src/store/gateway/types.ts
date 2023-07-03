import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { BareActionContext } from "vuex-typex"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState } from "../plasma/types"
import BN from "bn.js"
import { Contract, Address } from "loom-js"
import { TokenData } from "@/services/TokenService"

export declare type ChainName = "ethereum" | "binance" | "tron"

// Gateway module depends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
  gateway: GatewayState
}

export interface GatewayConfig {
  chains: string[]
  tokenContractLogsURL: string
  binance: BinanceGateway
  withdrawalLimit: boolean
}

export interface ITransferGatewayState {
  maxTotalDailyWithdrawalAmount: BN
  maxPerAccountDailyWithdrawalAmount: BN
  lastWithdrawalLimitResetTime: Date
  totalWithdrawalAmount: BN
}

export interface ILocalAccountInfo {
  withdrawalReceipt: IWithdrawalReceipt | null
  totalWithdrawalAmount: BN
  lastWithdrawalLimitResetTime: number
}

/**
 * Gateway state
 */
export interface GatewayState extends GatewayConfig {
  mapping: IAddressMapping | null
  ethereumAllowances: Array<{ token: TokenData, amount: BN }>
  pendingTransactions: any[]
  withdrawalReceipts: IWithdrawalReceipt | WithdrawalReceipt | null
  showDepositForm: boolean
  showWithdrawForm: boolean
  withdrawStates: WithdrawState[]
  withdrawStateIdx: number
  transferRequest: TransferRequest
  maybeRelentlessUser: boolean | null
  requireMapping: boolean
  ethereumMappings: {
    confirmed: IAddressMapping[],
    pending: IAddressMapping[],
  }

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
  /**
   * Holds fee information if the target chain
   * requires fees to be paid (on plasma chain)
   */
  fee?: {
    token: string
    amount: BN,
  }
  token: string
  contract: Contract | any
  withdraw(amount: BN, recipient?: Address)
  withdrawalReceipt(): Promise<IWithdrawalReceipt | null>
  getLocalAccountInfo(owner: Address): Promise<ILocalAccountInfo>
  getGatewayState(): Promise<ITransferGatewayState>
}

export interface WithdrawalReceipt extends IWithdrawalReceipt {
  chain: string
  symbol: string
}

export interface BinanceGateway {
  gatewayAccount: string
  fee: number
}
