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

describe("Delegating", () => {
  describe("requestDelegation", () => {
    let state: DPOSState
    let validator: ICandidate

    beforeEach(() => {
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
      const plasmaMock = sinon.mock(plasmaModule)
      plasmaMock.expects("getAddress").returns("xxx")

      requestDelegation(state, validator)
      expect(state.intent).to.equal("delegate")
    })
  })

  describe("delegate", () => {
    it.skip("calls DPOS.delegate")
  })
})
