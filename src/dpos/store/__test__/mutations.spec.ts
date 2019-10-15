import "mocha"
import { DPOSState, DPOSConfig } from "../types"
import BN from "bn.js"
import { defaultState } from "../helpers"
import sinon from "sinon"
import { setConfig, setElectionTime } from "../mutations"
import ProdConfig from "../../../config/production"
import DevConfig from "../../../config/dev"
import localConfig from "../../../config/local"
import { expect } from "chai"
import { DPOS3 } from "loom-js/dist/contracts"

describe("DPOS store, Mutations", () => {
  describe("setConfig", () => {
    let state: DPOSState
    let config: DPOSConfig
    const bootStrapNodes = {
      prodNode: ProdConfig.dpos.bootstrapNodes,
      devNode: DevConfig.dpos.bootstrapNodes,
      localNode: localConfig.dpos.bootstrapNodes,
    }

    before(() => {
      state = defaultState()
    })

    it("bootstrapNodes state array should have a member [production]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.prodNode,
        analyticsUrl: "",
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes.length > 0).to.be.true
    })

    it("bootstrapNodes state array should empty [develop]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.devNode,
        analyticsUrl: "",
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes).to.be.empty
    })

    it("bootstrapNodes state array should empty [local]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.localNode,
        analyticsUrl: "",
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes).to.be.empty
    })
  })

  describe("setElectionTime", () => {
    let state: DPOSState
    // 'time' measure in second
    let electionTime: any

    before(async () => {
      state = defaultState()

    })

    it("Election Time should be a next 2 minutes", () => {
      // set next election time to be a next 2 minutes
      electionTime = new Date(Date.now() + (120 * 1000))
      setElectionTime(state, electionTime)
      expect(state.electionTime).to.equals(electionTime)
    })

    it("Election time loading in state should be FALSE after set election time", () => {
      electionTime = new Date(Date.now() + (120 * 1000))
      setElectionTime(state, electionTime)
      // tslint:disable-next-line: no-unused-expression
      expect(state.loading.electionTime).to.false
    })
  })
})
