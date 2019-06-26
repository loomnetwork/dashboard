import "mocha"
import { DPOSState, DPOSConfig } from "../types"
import BN from "bn.js"
import { defaultState } from "../helpers";
import sinon from "sinon"
import { setConfig, setElectionTime } from "../mutations";

import { expect } from "chai"
import { DPOS3 } from 'loom-js/dist/contracts';

describe.only("Mutations", () => {
  describe("setConfig", () => {
    let state: DPOSState
    let config: DPOSConfig
    // TODO : init some var to use

    before(() => {
      //
      state = defaultState()
      config = {
        bootstrapNodes: [],
      }
      setConfig(state, config)
    })

    it("setup a config", () => {
      expect(state.bootstrapNodes).to.empty
      console.log("BOOTSTRAPNODES", state.bootstrapNodes)
    })
  })

  describe("setElectionTime", () => {
    let state: DPOSState
    let electionTime: Date
    let time: BN
    let time2: number
    let date: any
    const dpos3Stub = sinon.createStubInstance(DPOS3)

    before(async () => {
      state = defaultState()
      time = await dpos3Stub.getTimeUntilElectionAsync().then((result) => {
        time2 = result.toNumber()
      }).catch((err) => {
        console.log("GET TIME ERROR", err)
      });
      date = Date.now() + time2 * 1000
      setElectionTime(state, new Date(date))
    })

    it("set election time", () => {
      console.log("ELECTION TIME", state.electionTime.toTimeString())
    })
  })
})
