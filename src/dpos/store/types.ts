/**
 * @module dashboard.dpos
 */

import { HasPlasmaState } from "@/store/plasma/types"
import { ZERO } from "@/utils"
import BN from "bn.js"
import { Address, LocalAddress } from "loom-js"
import { DPOS3, ICandidate, IValidator, IDelegation } from "loom-js/dist/contracts/dpos3"
import bigInt from "big-integer"
import BigNumber from "bignumber.js"

import {
  CandidateState,
  DelegationState,
  LocktimeTier,
} from "loom-js/dist/proto/dposv3_pb"

// Interface for root stores that support EthereumState
export interface HasDPOSState extends HasPlasmaState {
  dpos: DPOSState
}

export interface DPOSConfig {
  bootstrapNodes: string[]
  analyticsUrl: string
}

export interface DPOSState extends DPOSConfig {
  contract: DPOS3 | null
  loading: {
    electionTime: boolean
    validators: boolean
    delegations: boolean
    rewards: boolean,
  }
  electionTime: Date
  validators: Validator[]
  delegations: Delegation[]
  rewards: Delegation[]
  // intent toggles visibility of the Delegate/Redelegate/UndelegateModal which in turn allow
  // the user to confirm the action, at which point the delegate/redelegate/undelegate functions
  // in src/dpos/store/index.ts get invoked.
  intent: "" | "delegate" | "redelegate" | "undelegate"
  delegation: Delegation | null
  analyticsData: any[] | null
  rewardsScalingFactor: BigNumber
  effectiveRewardsRatio: BigNumber
  maxYearlyRewards: BigNumber
  totalWeightedStakes: BigNumber
  minCandidateFee: number
  maxCandidateFee: number
}

/**
 * represents the merged structures from IValidator, ICandidate and Delegations
 */
export class Validator implements IValidator, ICandidate {
  // ICandidate
  pubKey: Uint8Array = new Uint8Array()
  maxReferralPercentage?: number | undefined
  fee: BN = new BN(-1)
  newFee: BN = new BN(-1)
  candidateState: CandidateState = -1
  name: string = ""
  description: string = ""
  website: string = ""
  // IValidator
  address = new Address("", new LocalAddress(new Uint8Array()))
  slashPercentage = ZERO
  delegationTotal = ZERO
  whitelistAmount = ZERO
  whitelistLocktimeTier: LocktimeTier = -1
  recentlyMissedBlocks = 0
  missedBlocks: number[] = []
  jailed: boolean = false

  /**
   * amount staked by others
   */
  stakedAmount = ZERO
  /**
   * stakeAmount + whitelistAmount
   */
  totalStaked = ZERO
  delegations: Delegation[] = []
  isBootstrap: boolean = false
  isFormer: boolean = false
  isHidden: boolean = false
  active: boolean = false
  /**
   * Lower case string representation of the local address
   */
  addr: string = ""
  allDelegations: IDelegation[] = []

  setCandidateData(c: ICandidate) {
    Object.assign(this, c)
    // this.delegationTotal = c.delegationTotal.sub(c.whitelistAmount)
    this.fee = c.fee.div(new BN(100))
    this.newFee = c.newFee.div(new BN(100))
    this.addr = c.address.local.toString().toLowerCase()
    this.delegationTotal = c.delegationTotal.sub((c.whitelistAmount))
  }
  setValidatorData(v: IValidator) {
    Object.assign(this, v)
    const bits = bigInt(this.recentlyMissedBlocks)
    this.missedBlocks = [
      // tslint:disable-next-line: no-bitwise
      bits.and(0xFFFF),
      // tslint:disable-next-line: no-bitwise
      (bits.shiftRight(16)).and(0xFFFF),
      // tslint:disable-next-line: no-bitwise
      (bits.shiftRight(32)).and(0xFFFF),
      // tslint:disable-next-line: no-bitwise
      (bits.shiftRight(48)).and(0xFFFF),
    ].map((b) => b.toJSNumber())
    // just reusit for the sum
    this.recentlyMissedBlocks = this.missedBlocks.reduce((a, b) => a + b, 0)
    this.jailed = v.jailed
    // if node has validator info then its active
    this.active = true
    // default value for nodes without delegations
    if (this.totalStaked.isZero()) {
      this.totalStaked = v.whitelistAmount
    }
  }
}

export interface Delegation {
  validator: Validator
  updateValidator: Validator | undefined
  delegator: Address
  index: number
  amount: BN
  updateAmount: BN
  lockTime: number
  lockTimeTier: LocktimeTier
  state: DelegationState
  referrer?: string
  pending: boolean
  locked: boolean
  isReward: boolean
}

export interface ICandidateRegistrationInfo {
  pubKey: Uint8Array
  whitelistLocktimeTier: LocktimeTier
  fee: BN
  name: string
  description: string
  website: string
}
