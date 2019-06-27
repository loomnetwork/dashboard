import "mocha"
import { requestDelegation } from ".."
import { defaultState } from "../helpers"
import { ICandidate } from "loom-js/dist/contracts/dpos3"
import { Address } from "loom-js"
import { LocktimeTier, CandidateState } from "loom-js/dist/proto/dposv3_pb"
import { ZERO } from "@/utils"

import { expect } from "chai"
import { DPOSState } from "../types"
import { plasmaModule } from "@/store/plasma"

import sinon from "sinon"

describe("Reactions", () => {
  describe("On client ready", () => {
    it.skip("creates the contract", () => { })
    it.skip("refreshes DPoS State", () => { })
    it.skip("schedules election time update call", () => { })
    it.skip("election time polling is throttle to 1 call per 10 seconds", () => { })
  })

  describe("On account change", () => {
    it.skip("(re)creates the contract with the right caller", () => { })
    it.skip("refreshes DPoS User State", () => { })
  })

  describe("On election time update", () => {
    it.skip("refreshes DPoS State", () => { })
    it.skip("does not refreshes DPoS Account State if state.plasma.address is not set", () => { })
    it.skip("refreshes DPoS Account State if state.plasma.address is set", () => { })
  })
})
