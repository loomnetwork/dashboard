import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { BareActionContext } from "vuex-typex"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState, PlasmaSigner } from "../plasma/types"
import { ValidatorManagerContract } from "./contracts/ValidatorManagerContract"
import BN from "bn.js"
import Web3 from "web3"
import { Contract, Address } from "loom-js"

import { Gateway } from "./contracts/Gateway"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"

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
  maybeRelentlessUser: boolean | null,
  gateways: {
    ethereum: Gateways | null,
    plasma: Gateways | null,
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
}

export interface WithdrawalReceipt extends IWithdrawalReceipt {
  chain: string
  symbol: string
}

/**
 * each token has specic methods for deposit and withdraw (and specific contract in case of loom coin)
 * EthereumGatewayAdapter is a simple abstraction to make those APIs uniform
 */
export interface EthereumGatewayAdapter {
  token: string
  contract: ERC20Gateway_v2 | Gateway

  deposit(amount: BN, address: string)
  withdraw(receipt: IWithdrawalReceipt)
}

export interface Gateways {
  readonly mainGateway: Gateway
  readonly loomGateway: ERC20Gateway_v2
  readonly vmc: ValidatorManagerContract | null
  readonly web3: Web3

  destroy: () => void
  get: (symbol: string) => EthereumGatewayAdapter
  add: (token: string, tokenAddress: string) => void

}
