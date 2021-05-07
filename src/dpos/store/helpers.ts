import { IDelegation } from "loom-js/dist/contracts/dpos3"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { Validator, Delegation, DPOSState } from "./types"
import BigNumber from "bignumber.js"
import { Address } from "loom-js"

export function defaultState(): DPOSState {
  return {
    bootstrapNodes: [],
    contract: null,
    loading: {
      electionTime: false,
      validators: false,
      delegations: false,
      rewards: false,
    },
    electionTime: new Date(),
    validators: [],
    delegations: [],
    rewards: [],

    intent: "",
    delegation: null,
    analyticsData: null,
    analyticsUrl: "",
    rewardsScalingFactor: new BigNumber(0),
    effectiveRewardsRatio: new BigNumber(0),
    maxYearlyRewards: new BigNumber(0),
    totalWeightedStakes: new BigNumber(0),
    minCandidateFee: 0,
    maxCandidateFee: 10000,
  }
}

export function fromIDelegation(d: IDelegation, validators: Validator[]) {
  const addr = d.validator.local.toString()
  let validator = validators.find((v) => v.address.local.toString() === addr)
  if (validator === undefined) {
    validator = formerValidator(d.validator)
  }
  const updateValidatorAddr = d.updateValidator
  let updateValidator: Validator | undefined
  if (updateValidatorAddr !== undefined) {
    const updateAddr = updateValidatorAddr.local.toString()
    updateValidator = validators.find((v) => v.address.local.toString() === updateAddr)
    if (validator === undefined) {
      updateValidator = formerValidator(updateValidatorAddr)
    }
  }
  const locked = d.lockTime * 1000 > Date.now()
  const pending = d.state !== DelegationState.BONDED
  const isReward = d.index === 0

  return Object.assign({}, d, {
    validator,
    updateValidator,
    locked,
    pending,
    isReward,
  }) as Delegation
}

/**
 * @param address
 */
export function formerValidator(address: Address): Validator {
  const addr = address.local.toString().toLowerCase()
  const name = addr.substring(35)
  const validator = new Validator()
  validator.addr = addr
  validator.address = address
  validator.name = `Former Validator ${name}`
  validator.description = "This validator is no longer active on Basechain."
  validator.isFormer = true
  return validator
}
