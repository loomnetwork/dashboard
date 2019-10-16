import { IDelegation } from "loom-js/dist/contracts/dpos3"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { Validator, Delegation, DPOSState } from "./types"
import { Address } from "loom-js"
import * as Sentry from "@sentry/browser"

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
// Temporary list of former validators
// So that users that have delegated to one of these
// can still move their delegations
export const FORMER_VALIDATORS = {
  "0xe3beb36ae8edb5dbb5c2cfba9960f0819dd8e13a": "Bixin",
}

/**
 * see FORMER_VALIDATORS
 * @param address
 */
export function formerValidator(address: Address): Validator {
  const addr = address.local.toString().toLowerCase()
  let name = FORMER_VALIDATORS[addr]
  if (name === undefined) {
    Sentry.captureException(new Error("Unknown former validator " + addr))
    name = `Former Validator ${addr.substring(35)}`
  }
  const validator = new Validator()
  validator.addr = addr
  validator.address = address
  validator.name = name
  validator.description = "This validator is no longer active on Basechain."
  return validator
}
