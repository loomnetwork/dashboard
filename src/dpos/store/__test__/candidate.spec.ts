import "mocha"
import sinon from "sinon"
import { ZERO, parseToWei } from "@/utils"
import { emptyValidator, feedbackModuleStub, plasmaModuleStub } from "./_helpers"
import { defaultState } from "../helpers"
import { ICandidate } from "loom-js/dist/contracts/dpos3"
import { DPOS3 } from "loom-js/dist/contracts"
import { registerCandidate } from ".."
import { Address, CryptoUtils } from "loom-js"

const rootState = {
  dpos: {
    contract: {
      address: Address.fromString("default:0x" + "".padEnd(40, "0")),
    },
  },
  plasma: {
    coins: {
      LOOM: {
        balance: ZERO,
      },
    },
  },
}

describe("Validator Management", () => {

  describe("action registerCandidate", () => {
    const state = defaultState()
    // @ts-ignore
    const candidate: ICandidate = emptyValidator()
    const weiAmount = parseToWei("1250000")
    const token = "LOOM"
    const address = rootState.dpos.contract.address.local.toString()
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    // @ts-ignore
    state.contract = dpos3Stub

    before(() => {
      plasmaModuleStub.approve.reset()
      plasmaModuleStub.allowance.resolves(parseToWei("100"))
    })

    it.skip("Checks account balance >= 1.25M LOOM")
    it("Fails with feedback notification if insufficient funds", async () => {
      // @ts-ignore
      await registerCandidate({ ...{ state }, ...{ rootState } }, candidate)
      sinon.assert.calledOnce(feedbackModuleStub.showError)
      sinon.assert.calledWith(feedbackModuleStub.showError, "Insufficient funds.")
    })
    it("Checks account allowance", async () => {
      rootState.plasma.coins.LOOM.balance = weiAmount
      // @ts-ignore
      await registerCandidate({ ...{ state }, ...{ rootState } }, candidate)
      sinon.assert.calledOnce(plasmaModuleStub.allowance)
      sinon.assert.calledWith(plasmaModuleStub.allowance, { token, spender: address })
    })
    it("Asks for approval if insufficient allowance", () => {
      sinon.assert.calledOnce(plasmaModuleStub.approve)
      sinon.assert.calledWith(plasmaModuleStub.approve, { symbol: token, weiAmount, to: address })
    })
    it("calls DPOS3.registerCandidateAsync", () => {
      sinon.assert.calledOnce(dpos3Stub.registerCandidateAsync)
      sinon.assert.calledWith(dpos3Stub.registerCandidateAsync,
        CryptoUtils.Uint8ArrayToB64(candidate.pubKey),
        candidate.fee,
        candidate.name,
        candidate.description,
        candidate.website,
        candidate.whitelistLocktimeTier,
      )
    })
  })
})
