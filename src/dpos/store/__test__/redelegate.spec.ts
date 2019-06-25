import "mocha"
import { requestRedelegation } from ".."
import { defaultState, fromIDelegation } from "../helpers"
import { ICandidate } from "loom-js/dist/contracts/dpos3"
import { Address, CryptoUtils } from "loom-js"
import { LocktimeTier, CandidateState, DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { ZERO } from "@/utils"

import { expect } from "chai"
import { DPOSState, Delegation, Validator } from "../types"
import BN from "bn.js"
import sinon from "sinon"

describe("Redelegation", () => {
  describe("requestRedelegation", () => {
    let state: DPOSState
    let delegation: Delegation
    let validator1: ICandidate

    before(() => {
      state = defaultState()
      validator1 = {
        address: Address.fromString("default:0x" + "".padEnd(40, "0")),
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
      delegation = fromIDelegation({
        amount: new BN(1000),
        updateAmount: new BN(1000),
        index: 1,
        state: DelegationState.BONDED,
        delegator: Address.fromString("default:0x" + "".padEnd(40, "0")),
        lockTime: 0,
        lockTimeTier: 0,
        validator: validator1.address,
        referrer: "",
      },
        // @ts-ignore
        [validator1])
      requestRedelegation(state, delegation)
    })

    it("sets state.intent to redelegate", () => {
      expect(state.intent).to.equal("redelegate")
    })
    it("sets state.delegation", () => {
      expect(state.delegation).to.deep.equal(delegation)
    })
  })

  describe("redelegate", () => {
    it.skip("calls DPOS.redelegateAsync")
    it.skip("sends delegation.updateValidator.address as address")
    it.skip("sends delegation.updateAmount as amount to redelegate")
    it.skip("sends delegation.index as index")
  })
})
