import { IDelegation } from "loom-js/dist/contracts/dpos3"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { Validator, Delegation, DPOSState } from "./types"
import { ZERO } from "@/utils"
import BigNumber from "bignumber.js"
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
    rewardsScalingFactor: new BigNumber(0),
    effectiveRewardsRatio: new BigNumber(0),
    maxYearlyRewards: new BigNumber(0),
    totalWeightedStakes: new BigNumber(0),
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
// Validators name list
// So that users that have delegated to one of these
// can still move their delegations
export const VALIDATOR_NAMES = {
  "0xe3beb36ae8edb5dbb5c2cfba9960f0819dd8e13a": "Bixin",
  "0x5ba928ace46672f15e6d8364084f1d6ae302543e": "BlockMatrix",
  "0x9f1581a14f1194ab4913745301b55fe8d20595fe": "Chorus One",
  "0x59dd7302bf628156f948a9101169135324058d60": "NGC_StakeX",
  "0x6b3dd380eb365603182617d698fdbbe52befa801": "CoboWallet",
  "0xa5b2c08c1dcd58d819317b79cbc9b5a8566bdf73": "Cannon Lab",
  "0xeb5d1fa6e421485c7ae2fba8e3199588ed931daf": "Stake Capital",
  "0x8ec7faf77cc27eee73ae25b077fe5d05277cd8cc": "MultiChain Ventures",
  "0x3e4aacbb025adccc6b9b653ad54cccce05c6af67": "Binance Staking",
  "0xa38c27e8cf4a443e805065065aefb250b1e1cef2": "stakewith.us",
  "0x9c6259c5b2a71c8642c2c84ccfb8f734e6bc6b87": "Blockware_Solutions",
  "0x7bc38ff819b75f85275d2fd83080ec337b4e0afe": "Mythos",
  "0x1985871ed65b80e09eca382c3e3c2d6831e092ec": "BlockTower",
  "0xe6fbaafc34f746ac2280fa8bd1787a8292f13148": "Infstones (Infinity Stones)",
  "0xb6b0f012149fbaaab596f762434de54c6c27d16c": "Loom Validator",
  "0xd58d72b3bef93fcbf13466cb2d83bcc145843510": "Wetez",
  "0xd333a00274133bc4cc4c8b84329a6e3828ce0525": "Huobi Wallet",
  "0xfbc2e5c9610c6c02e58f8bbcea7d4b356ea34f90": "Axie Infinity",
  "0x0ca3d6bf201ce53c7ddc3cb397ae33a68ed4a328": "ShipChain",
  "0xb7b1a2ed7c47287ba4da1fd17f626faf2134e9d0": "stake.fish",
  "0xa2e56e6253407242674c34ae7aeb7ae11883bcdb": "SNZPool",
  "0x911ac334f7014f0635b95a4a2225b45c5292c6c6": "Certus One | CMCC Global",
  "0x319e459f5d0ddc5ddf3e3610398a8b6e6772daa3": "Hey.network",
}

/**
 * see VALIDATOR_NAMES
 * @param address
 */
export function formerValidator(address: Address): Validator {
  const addr = address.local.toString().toLowerCase()
  let name = VALIDATOR_NAMES[addr]
  if (name === undefined) {
    name = `${addr.substring(35)}`
  }
  const validator = new Validator()
  validator.addr = addr
  validator.address = address
  validator.name = `Former Validator ${name}`
  validator.description = "This validator is no longer active on Basechain."
  validator.isFormer = true
  return validator
}
