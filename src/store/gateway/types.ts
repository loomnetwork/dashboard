import { ethers } from "ethers"
import {
  Address,
  LocalAddress,
  NonceTxMiddleware,
  SignedEthTxMiddleware,
} from "loom-js"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { BareActionContext } from "vuex-typex"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState, PlasmaSigner } from "../plasma/types"
import BN from "bn.js"

// Gateway module depends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
  gateway: GatewayState
}

/**
 * Gateway state
 */
export interface GatewayState {
  mapping: IAddressMapping | null
  pendingTransactions: any[]
  withdrawalReceipts: IWithdrawalReceipt | null
  showDepositForm: boolean
  showDepositApproved: boolean
  showDepositConfirmed: boolean
  showWithdrawForm: boolean,
  showWithdrawProgress: boolean,
  withdrawStates: WithdrawState[],
  withdrawStateIdx: number,
  notMapped: boolean,
  newMappingAgree: boolean,
}

export interface WithdrawalReceiptsV2 extends IWithdrawalReceipt {
  decodedSig: {
    valIndexes: Array<number | string>
    vs: Array<number | string>
    rs: Array<string | number[]>
    ss: Array<string | number[]>,
  }
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

  withdraw(amount: BN)
  withdrawalReceipt(): Promise<IWithdrawalReceipt | null>
}
