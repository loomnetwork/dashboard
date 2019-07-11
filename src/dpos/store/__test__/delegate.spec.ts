import "mocha"
import { requestDelegation, delegate } from ".."
import { defaultState, fromIDelegation } from "../helpers"
import { ICandidate, DPOS3 } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import { LocktimeTier, CandidateState, DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { ZERO } from "@/utils"
import BN from "bn.js"

import { expect } from "chai"
import { DPOSState } from "../types"
import { emptyValidator, feedbackModuleStub, plasmaModuleStub } from "./_helpers"

import sinon from "sinon"

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

describe("Delegating", () => {
  describe("requestDelegation", () => {
    let state: DPOSState
    let validator: ICandidate

    beforeEach(() => {
      plasmaModuleStub.getAddress.returns(Address.fromString("default:0x" + "".padEnd(40, "0")))
      state = defaultState()
      validator = {
        address: Address.fromString(":0x".padEnd(44, "0")),
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
    })

    it("sets correct intent to delegate", () => {
      requestDelegation(state, validator)
      expect(state.intent).to.equal("delegate")
    })
  })

  describe("delegate", () => {
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    let state: DPOSState

    before(() => {
      state = defaultState()
      plasmaModuleStub.approve.reset()
      plasmaModuleStub.approve.resolves(true)
      // @ts-ignore
      state.contract = dpos3Stub
      state.contract!.address = Address.fromString(":0x".padEnd(44, "0"))
      state.delegation = dummyDelegation(emptyValidator())
      // @ts-ignore
      delegate({
        state,
      }, state.delegation)
    })

    it("calls plasmaModule.approve", () => {
      const d = state.delegation!
      sinon.assert.calledOnce(plasmaModuleStub.approve)
      sinon.assert.calledWith(plasmaModuleStub.approve, {
        symbol: "LOOM",
        weiAmount: d.amount,
        to: state.contract!.address.local.toString(),
      })
    })

    it("calls DPOS.delegateAsync", () => {
      const d = state.delegation!
      sinon.assert.calledOnce(dpos3Stub.delegateAsync)
      sinon.assert.calledWith(dpos3Stub.delegateAsync,
        d.validator.address, d.amount, d.lockTimeTier)
    })

    it("notifies feedback module", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        plasmaModuleStub.approve,
        feedbackModuleStub.setStep,
        dpos3Stub.delegateAsync,
        feedbackModuleStub.endTask,
      )
    })
  })

})
