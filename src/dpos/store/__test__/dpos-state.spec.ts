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
    it.skip("calls DPOS.delegate")
    it.skip("sends delegation.validator.address as address")
    it.skip("sends delegation.updateAmount as amount")
    it.skip("sends delegation.index as index")
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
