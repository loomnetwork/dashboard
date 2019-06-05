import { IDelegation } from "loom-js/dist/contracts/dpos3"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { Validator, Delegation } from "./types"

export function fromIDelegation(d: IDelegation, validators: Validator[]) {
  const validator = validators.find((v) =>
    v.address.local.equals(d.validator.local),
  )!
  const updateValidatorAddr = d.updateValidator
  let updateValidator: Validator | undefined
  if (updateValidatorAddr !== undefined) {
    updateValidator = validators.find((v) =>
      v.address.local.equals(updateValidatorAddr.local),
    )!
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
