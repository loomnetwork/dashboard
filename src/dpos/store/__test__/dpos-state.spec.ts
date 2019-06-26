import "mocha"
import { refreshElectionTime, dposModule } from ".."
import { defaultState } from "../helpers"
import { ICandidate, DPOS3 } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import { LocktimeTier, CandidateState } from "loom-js/dist/proto/dposv3_pb"
import { ZERO } from "@/utils"
import BN from "bn.js"

import { expect } from "chai"
import { DPOSState } from "../types"

import sinon from "sinon"

describe("DPoS state", () => {
  describe("refreshValidators", () => {
    it.skip("calls DPOS.delegate")
    it.skip("calls DPOS.delegate")
    it.skip("calls DPOS.delegate")

    it.skip("merges validator info in one object")

    it.skip("sets bootstrap validators following addresses state.bootstrapNodes")
    it.skip("sets delegations amounts correctly")

  })

  describe("refreshElectionTime", () => {
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    const setElectionTimeStub = sinon.stub(dposModule, "setElectionTime")
    const now = Date.now()
    const nowStub = sinon.stub(Date, "now")
    const time = new BN(100)
    let state: DPOSState

    before(() => {
      state = defaultState()
      dpos3Stub.getTimeUntilElectionAsync.resolves(time)
      nowStub.returns(now)
      setElectionTimeStub.resolves()
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
      sinon.assert.calledOnce(setElectionTimeStub)
      sinon.assert.calledWith(setElectionTimeStub, new Date(date))
    })
  })

  describe("DPoS Account state", () => {
    describe("refreshDelegations", () => {
      it.skip("calls DPOS.delegate")
      it.skip("sends delegation.validator.address as address")
      it.skip("sends delegation.updateAmount as amount")
      it.skip("sends delegation.index as index")
    })
  })
})
