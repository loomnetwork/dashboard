import "mocha"
import Vuex from "vuex"
import { createLocalVue } from "@vue/test-utils"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"
import { dposUtils, dposReactions } from "../reactions"
import { DPOS3 } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import lolex from "lolex"
import { contracts as plasmaTokenContracts } from "@/store/plasma/tokens"
import { CoinAdapter } from "@/store/plasma/tokens"
import sinon from "sinon"
import { now, nowStub, dposUtilsStub, dposModuleStub, plasmaModuleStub } from "./_helpers"

const localVue = createLocalVue()
localVue.use(Vuex)

const store = getStoreBuilder<DashboardState>().vuexStore()
dposReactions(store)

describe("Reactions", () => {
  describe("On client ready", () => {
    before(() => {
      dposUtilsStub.onClientReady.restore()
      dposUtils.onClientReady()
    })

    after(() => {
      sinon.stub(dposUtils, "onClientReady")
    })

    it("creates the contract", () => {
      sinon.assert.calledOnce(dposUtilsStub.createContract)
    })
    it("refreshes election time", () => {
      sinon.assert.calledOnce(dposModuleStub.refreshElectionTime)
    })
  })

  describe("On account change", () => {
    before(async () => {
      dposUtilsStub.createContract.reset()
      dposUtilsStub.onAccountChange.restore()

      await dposUtils.onAccountChange()
    })

    it("(re)creates the contract with the right caller", () => {
      sinon.assert.calledOnce(dposUtilsStub.createContract)
    })
    it("refreshes DPoS User State", () => {
      sinon.assert.calledOnce(dposUtilsStub.refreshDPoSUserState)
    })
  })

  describe("On election time update", () => {
    const date = new Date()
    const getTimeStub = sinon.stub(date, "getTime")
    const time = 10000
    let clock

    before(() => {
      clock = lolex.install()
      dposModuleStub.refreshElectionTime.reset()
      dposUtilsStub.scheduleElectionTimeCall.restore()

      getTimeStub.returns(time)
      nowStub.returns(now)

      dposUtils.scheduleElectionTimeCall()
    })
    after(() => {
      clock.uninstall()
    })

    it("refresh election time after delay", () => {
      const delay = Math.max(time - now, 10000)
      clock.tick(delay)
      sinon.assert.calledOnce(dposModuleStub.refreshElectionTime)
    })
  })

  describe("Refresh DPoS state", () => {
    before(() => {
      dposUtilsStub.refreshDPoSState.restore()
    })

    beforeEach(() => {
      dposUtilsStub.refreshDPoSUserState.reset()
      dposModuleStub.refreshValidators.reset()
    })

    it("does not refreshes DPoS Account State if state.plasma.address is not set", async () => {
      plasmaTokenContracts.clear()
      await dposUtils.refreshDPoSState()

      sinon.assert.calledOnce(dposModuleStub.refreshValidators)
      sinon.assert.notCalled(dposUtilsStub.refreshDPoSUserState)
    })
    it("refreshes DPoS Account State if LOOM contract ready", async () => {
      // store.state.plasma.address = "0x0000000000000000000000000000000000000000"
      sinon.stub(store.state.plasma, "address").value("0x0000000000000000000000000000000000000000")
      const stubContract = sinon.createStubInstance(CoinAdapter)
      plasmaTokenContracts.set("LOOM", stubContract)
      // dposModuleStub.refreshValidators.resolves()
      await dposUtils.refreshDPoSState()
      console.log(dposUtilsStub.refreshDPoSUserState.callCount)
      sinon.assert.calledOnce(dposModuleStub.refreshValidators)
      sinon.assert.calledOnce(dposUtilsStub.refreshDPoSUserState)
      plasmaTokenContracts.clear()
    })
  })

  describe("Refresh DPoS user state", () => {
    before(async () => {
      dposUtilsStub.refreshDPoSUserState.restore()
      const stubContract = sinon.createStubInstance(CoinAdapter)
      plasmaTokenContracts.set("LOOM", stubContract)
      await dposUtils.refreshDPoSUserState()
    })

    after(() => {
      plasmaTokenContracts.clear()
    })

    it("calls plasmaModule.refreshBalance", () => {
      sinon.assert.calledOnce(plasmaModuleStub.refreshBalance)
      sinon.assert.calledWith(plasmaModuleStub.refreshBalance, "LOOM")
    })

    it("calls dposModule.refreshDelegations", () => {
      sinon.assert.calledOnce(dposModuleStub.refreshDelegations)
    })
  })

  describe("Create contract", () => {
    const dpos3Stub = sinon.stub(DPOS3, "createAsync")
    const caller = Address.fromString("default:0x" + "".padEnd(40, "0"))

    before(() => {
      dposUtilsStub.createContract.restore()
      plasmaModuleStub.getCallerAddress.resolves(caller)
      dpos3Stub.resolves()

      dposUtils.createContract(store)
    })

    it("calls plasmaModule.getCallerAddress", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getCallerAddress)
    })

    it("calls DPOS3.createAsync", () => {
      sinon.assert.calledOnce(dpos3Stub)
      sinon.assert.calledWith(dpos3Stub, store.state.plasma.client!, caller)
    })
  })
})
