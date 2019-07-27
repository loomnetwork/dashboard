import "mocha"
import { requestRedelegation, redelegate } from ".."
import { defaultState, fromIDelegation } from "../helpers"
import { ICandidate, DPOS3 } from "loom-js/dist/contracts/dpos3"
import { Address, CryptoUtils } from "loom-js"
import { LocktimeTier, CandidateState, DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { ZERO } from "@/utils"

import { expect } from "chai"
import { DPOSState, Delegation, Validator } from "../types"
import BN from "bn.js"
import sinon from "sinon"
import { emptyValidator, feedbackModuleStub } from "./_helpers"
import { noop } from "rxjs"

function dummyDelegation(validator) {
  return fromIDelegation({
    amount: new BN(1000),
    updateAmount: new BN(1000),
    index: 1,
    state: DelegationState.BONDED,
    delegator: Address.fromString("default:0x" + "".padEnd(40, "0")),
    lockTime: 0,
    lockTimeTier: 0,
    validator: validator.address,
    referrer: "",
  },
    // @ts-ignore
    [validator])
}

describe("Redelegation", () => {
  describe("requestRedelegation", () => {
    let state: DPOSState
    let delegation: Delegation
    let validator1: ICandidate

    before(() => {
      state = defaultState()
      validator1 = {
        address: Address.fromString("default:0x" + "".padEnd(40, "0")),
        pubKey: new Uint8Array(),
        delegationTotal: ZERO,
        slashPercentage: ZERO,
        whitelistAmount: ZERO,
        whitelistLocktimeTier: LocktimeTier.TIER_ONE,
        fee: ZERO,
        newFee: ZERO,
        candidateState: CandidateState.REGISTERED,
        name: "",
        description: "",
        website: "",
      }
      delegation = fromIDelegation({
        amount: new BN(1000),
        updateAmount: new BN(1000),
        index: 1,
        state: DelegationState.BONDED,
        delegator: Address.fromString("default:0x" + "".padEnd(40, "0")),
        lockTime: 0,
        lockTimeTier: 0,
        validator: validator1.address,
        referrer: "",
      },
        // @ts-ignore
        [validator1])
      requestRedelegation(state, delegation)
    })

    it("sets state.intent to redelegate", () => {
      expect(state.intent).to.equal("redelegate")
    })
    it("sets state.delegation", () => {
      expect(state.delegation).to.deep.equal(delegation)
    })
  })

  describe("redelegate", () => {
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    let state: DPOSState

    before(() => {
      state = defaultState()
      dpos3Stub.redelegateAsync.resolves()
      // @ts-ignore
      state.contract = dpos3Stub
      state.delegation = dummyDelegation(emptyValidator())
      // @ts-ignore
      state.delegation.updateValidator = {
        address: Address.fromString("default:0x" + "".padEnd(40, "0")),
        pubKey: new Uint8Array(),
        delegationTotal: ZERO,
        slashPercentage: ZERO,
        whitelistAmount: ZERO,
        whitelistLocktimeTier: LocktimeTier.TIER_ONE,
        recentlyMissedBlocks: 0,
        fee: ZERO,
        newFee: ZERO,
        candidateState: CandidateState.REGISTERED,
        name: "",
        description: "",
        website: "",
        stakedAmount: ZERO,
        delegations: [],
        totalStaked: ZERO,
        isBootstrap: false,
        active: true,
        addr: "",
        setCandidateData: noop,
        setValidatorData: noop,
      }
      // @ts-ignore
      redelegate({
        state,
      }, state.delegation)
    })

    it("calls DPOS.redelegateAsync", () => {
      const d = state.delegation!
      sinon.assert.calledOnce(dpos3Stub.redelegateAsync)
      sinon.assert.calledWith(dpos3Stub.redelegateAsync,
        d.validator.address, d.updateValidator!.address, d.updateAmount, d.index)
    })
    it("notifies feedback module", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        feedbackModuleStub.setStep,
        dpos3Stub.redelegateAsync,
        feedbackModuleStub.endTask,
      )
    })
    it.skip("sends delegation.updateValidator.address as address")
    it.skip("sends delegation.updateAmount as amount to redelegate")
    it.skip("sends delegation.index as index")
  })
})
