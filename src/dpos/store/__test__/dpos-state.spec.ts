import "mocha"
import { refreshElectionTime, refreshDelegations, dposModule } from ".."
import { defaultState } from "../helpers"
import { DPOS3 } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import BN from "bn.js"

import { DPOSState } from "../types"

import sinon from "sinon"
import { plasmaModuleStub } from "./_helpers"

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
      setElectionTimeStub.returns()
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
