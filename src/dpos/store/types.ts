/**
 * @module dashboard.dpos
 */

import { HasPlasmaState } from "@/store/plasma/types"
import { ZERO } from "@/utils"
import BN from "bn.js"
import { Address, LocalAddress } from "loom-js"
import { DPOS3, ICandidate, IValidator } from "loom-js/dist/contracts/dpos3"
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
  // when user is requesting an action
  intent: "" | "delegate" | "redelegate" | "undelegate"
  delegation: Delegation | null
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
  active: boolean = false
  addr: string = ""

  setCandidateData(c: ICandidate) {
    Object.assign(this, c)
    // this.delegationTotal = c.delegationTotal.sub(c.whitelistAmount)
    this.fee = c.fee.div(new BN(100))
    this.newFee = c.newFee.div(new BN(100))
    this.addr = c.address.local.toString().toLocaleLowerCase()
    this.delegationTotal = c.delegationTotal.sub((c.whitelistAmount))
  }
  setValidatorData(v: IValidator) {
    Object.assign(this, v)
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
