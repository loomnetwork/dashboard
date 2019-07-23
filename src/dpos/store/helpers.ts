import { IDelegation } from "loom-js/dist/contracts/dpos3"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { Validator, Delegation, DPOSState } from "./types"
import { ZERO } from "@/utils"

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
  }
}

export function fromIDelegation(d: IDelegation, validators: Validator[]) {
  const addr = d.validator.local.toString()
  const validator = validators.find(
    (v) =>
      // loom-js local.equals is broken
      v.address.local.toString() === addr,
  )!
  const updateValidatorAddr = d.updateValidator
  let updateValidator: Validator | undefined
  if (updateValidatorAddr !== undefined) {
    const updateAddr = updateValidatorAddr.local.toString()
    updateValidator = validators.find((v) => v.address.local.toString() === updateAddr)!
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
