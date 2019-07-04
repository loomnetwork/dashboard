import "mocha"
import { requestUndelegation, undelegate } from ".."
import { defaultState, fromIDelegation } from "../helpers"
import { ICandidate, DPOS3 } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import { LocktimeTier, CandidateState, DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { ZERO } from "@/utils"
import BN from "bn.js"

import { expect } from "chai"
import { DPOSState, Delegation } from "../types"

import sinon from "sinon"
import { emptyValidator, feedbackModuleStub } from "./_helpers"

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

describe("Undelegate", () => {
  describe("requestUndelegation", () => {
    let state: DPOSState
    let validator: ICandidate
    let delegation: Delegation

    before(() => {
      state = defaultState()
      validator = {
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
        validator: validator.address,
        referrer: "",
      },
        // @ts-ignore
        [validator])
      requestUndelegation(state, delegation)
    })

    it("sets correct intent to undelegate", () => {
      expect(state.intent).to.equal("undelegate")
    })
    it("sets state.delegation", () => {
      expect(state.delegation).to.not.equal(null)
      expect(state.delegation).to.deep.equal(delegation)
    })
  })

  describe("undelegate()", () => {
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    let state: DPOSState
    before(() => {
      state = defaultState()
      dpos3Stub.unbondAsync.resolves()
      // @ts-ignore
      state.contract = dpos3Stub
      state.delegation = dummyDelegation(emptyValidator())
      // @ts-ignore
      undelegate({
        state,
      }, state.delegation)
    })

    it("calls DPOS.unbondAsync", () => {
      const d = state.delegation!
      sinon.assert.calledOnce(dpos3Stub.unbondAsync)
      sinon.assert.calledWith(dpos3Stub.unbondAsync,
        d.validator.address, d.updateAmount, d.index)
    })
    it("notifies feedback module", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        feedbackModuleStub.setStep,
        dpos3Stub.unbondAsync,
        feedbackModuleStub.endTask,
      )
    })
    it("sends delegation.updateAmount as amount")
    it("sends delegation.index as index")
  })
})
