import "mocha"
import { refreshValidators, refreshElectionTime, refreshDelegations } from ".."
import { defaultState } from "../helpers"
import { DPOS3, ICandidate, ICandidateDelegations, IValidator } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
import BN from "bn.js"

import { expect } from "chai"
import { DPOSState } from "../types"

import sinon from "sinon"
import { emptyValidator, now, nowStub, plasmaModuleStub, dposModuleStub } from "./_helpers"

describe("DPoS state", () => {
  describe("refreshValidators", () => {
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    const validator: IValidator = emptyValidator()
    // @ts-ignore
    const candidate: ICandidate = emptyValidator()
    const delegation: ICandidateDelegations = {
      delegationTotal: new BN(100),
      delegationsArray: [{
        amount: new BN(1000),
        updateAmount: new BN(1000),
        index: 1,
        state: DelegationState.BONDED,
        delegator: Address.fromString("default:0x" + "".padEnd(40, "0")),
        lockTime: 0,
        lockTimeTier: 0,
        validator: validator.address,
        referrer: "",
      }],
    }
    let state: DPOSState

    before(() => {
      state = defaultState()
      dpos3Stub.getValidatorsAsync.resolves([validator])
      dpos3Stub.getCandidatesAsync.resolves([candidate])
      dpos3Stub.getAllDelegations.resolves([delegation])
      // @ts-ignore
      state.contract = dpos3Stub
      // @ts-ignore
      refreshValidators({ state })
    })

    it("calls DPOS.getValidatorsAsync", () => {
      sinon.assert.calledOnce(dpos3Stub.getValidatorsAsync)
    })

    it("calls DPOS.getCandidatesAsync", () => {
      sinon.assert.calledOnce(dpos3Stub.getCandidatesAsync)
    })

    it("calls DPOS.getAllDelegations", () => {
      sinon.assert.calledOnce(dpos3Stub.getAllDelegations)
    })

    it("merges validator info in one object", () => {
      expect(state.validators[0].isBootstrap).to.equal(false)
      expect(state.validators[0].stakedAmount).to.equal(delegation.delegationTotal)
    })

    it("validators loading should finished", () => {
      expect(state.loading.validators).to.equal(false)
    })

    it.skip("sets bootstrap validators following addresses state.bootstrapNodes")
    it.skip("sets delegations amounts correctly")

  })

  describe("refreshElectionTime", () => {
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    const time = new BN(100)
    let state: DPOSState

    before(() => {
      state = defaultState()
      dpos3Stub.getTimeUntilElectionAsync.resolves(time)
      nowStub.returns(now)
      dposModuleStub.setElectionTime.returns()
      // @ts-ignore
      state.contract = dpos3Stub
      // @ts-ignore
      refreshElectionTime({ state })
    })

    it("calls DPOS.getTimeUntilElectionAsync", () => {
      sinon.assert.calledOnce(dpos3Stub.getTimeUntilElectionAsync)
    })
    it("calls dposModule.setElectionTime", () => {
      const date = now + time.toNumber() * 1000
      sinon.assert.calledOnce(dposModuleStub.setElectionTime)
      sinon.assert.calledWith(dposModuleStub.setElectionTime, new Date(date))
    })
  })

  describe("DPoS Account state", () => {
    describe("refreshDelegations", () => {
      const dpos3Stub = sinon.createStubInstance(DPOS3)
      const address = Address.fromString(":0x".padEnd(44, "0"))
      let state: DPOSState

      before(() => {
        state = defaultState()
        plasmaModuleStub.getAddress.returns(address)
        dpos3Stub.checkAllDelegationsAsync.resolves({
          amount: new BN(100),
          weightedAmount: new BN(100),
          delegationsArray: [],
        })
        // @ts-ignore
        state.contract = dpos3Stub
        // @ts-ignore
        refreshDelegations({ state })
      })

      it("calls DPOS.checkAllDelegationsAsync", () => {
        sinon.assert.calledOnce(dpos3Stub.checkAllDelegationsAsync)
        sinon.assert.calledWith(dpos3Stub.checkAllDelegationsAsync,
          address)
      })
    })
  })
})
