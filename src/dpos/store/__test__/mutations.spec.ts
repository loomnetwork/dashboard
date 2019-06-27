import "mocha"
import { DPOSState, DPOSConfig } from "../types"
import BN from "bn.js"
import { defaultState } from "../helpers";
import sinon from "sinon"
import { setConfig, setElectionTime } from "../mutations";
import StageConfig from "../../../config/stage"
import ProdConfig from "../../../config/production"
import DevConfig from "../../../config/dev"
import localConfig from "../../../config/local"
import { expect } from "chai"
import { DPOS3 } from 'loom-js/dist/contracts';

describe.only("Mutations", () => {
  describe("setConfig", () => {
    let state: DPOSState
    let config: DPOSConfig
    const bootStrapNodes = {
      stageNode: StageConfig.dpos.bootstrapNodes,
      prodNode: ProdConfig.dpos.bootstrapNodes,
      devNode: DevConfig.dpos.bootstrapNodes,
      localNode: localConfig.dpos.bootstrapNodes,
    }
    // TODO : init some var to use

    before(() => {
      state = defaultState()
    })

    it("bootstrapNodes state array should have a member [stage]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.stageNode,
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes.length > 0).to.be.true
      console.log("BOOTSTRAPNODES", state.bootstrapNodes)
    })

    it("bootstrapNodes state array should have a member [production]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.prodNode,
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes.length > 0).to.be.true
      console.log("BOOTSTRAPNODES", state.bootstrapNodes)
    })

    it("bootstrapNodes state array should empty [develop]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.devNode,
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes).to.be.empty
      console.log("BOOTSTRAPNODES", state.bootstrapNodes)
    })

    it("bootstrapNodes state array should empty [local]", () => {
      config = {
        bootstrapNodes: bootStrapNodes.localNode,
      }
      setConfig(state, config)
      // tslint:disable-next-line: no-unused-expression
      expect(state.bootstrapNodes).to.be.empty
      console.log("BOOTSTRAPNODES", state.bootstrapNodes)
    })

  // describe("setElectionTime", () => {
  //   let state: DPOSState
  //   let electionTime: Date
  //   let time: BN
  //   let time2: number
  //   let date: any
  //   const dpos3Stub = sinon.createStubInstance(DPOS3)

  //   before(async () => {
  //     state = defaultState()
  //     time = await dpos3Stub.getTimeUntilElectionAsync().then((result) => {
  //       time2 = result.toNumber()
  //     }).catch((err) => {
  //       console.log("GET TIME ERROR", err)
  //     });
  //     date = Date.now() + time2 * 1000
  //     setElectionTime(state, new Date(date))
  //   })

  //   it("set election time", () => {
  //     console.log("ELECTION TIME", state.electionTime.toTimeString())
  //   })
  // })
  })
})
