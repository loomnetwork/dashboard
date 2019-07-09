import "mocha"
import sinon from "sinon"
import { ZERO, parseToWei } from "@/utils"
import { emptyValidator, feedbackModuleStub, ethereumModuleStub } from "./_helpers"
import { defaultState } from "../helpers"
import { ICandidate } from "loom-js/dist/contracts/dpos3"
import { DPOS3 } from "loom-js/dist/contracts"
import { registerCandidate } from ".."
import { CryptoUtils } from "loom-js"

const rootState = {
  plasma: {
    coins: {
      LOOM: {
        balance: ZERO,
      },
    },
  },
}

describe("Validator Management", () => {

  describe.only("action registerCandidate", () => {
    const state = defaultState()
    const candidate: ICandidate = emptyValidator()
    const weiAmount = parseToWei("1240000")
    const symbol = "LOOM"
    const address = candidate.address.local.toString()
    const dpos3Stub = sinon.createStubInstance(DPOS3)
    // @ts-ignore
    state.contract = dpos3Stub

    before(() => {
      ethereumModuleStub.allowance.resolves(parseToWei("100"))
    })

    it.skip("Checks account balance >= 1.24M LOOM")
    it("Fails with feedback notification if insufficient funds", async () => {
      // @ts-ignore
      await registerCandidate({ ...{ state }, ...{rootState} }, candidate)
      sinon.assert.calledOnce(feedbackModuleStub.showError)
      sinon.assert.calledWith(feedbackModuleStub.showError, "Insufficient funds.")
    })
    it("Checks account allowance", async () => {
      rootState.plasma.coins.LOOM.balance = weiAmount
      // @ts-ignore
      await registerCandidate({ ...{ state }, ...{rootState} }, candidate)
      sinon.assert.calledOnce(ethereumModuleStub.allowance)
      sinon.assert.calledWith(ethereumModuleStub.allowance, { symbol, spender: address })
    })
    it("Asks for approval if insufficient allowance", () => {
      sinon.assert.calledOnce(ethereumModuleStub.approve)
      sinon.assert.calledWith(ethereumModuleStub.approve,
        {
          to: address,
          ...{ chain: candidate.address.chainId, symbol, weiAmount },
        },
      )
    })
    it("calls DPOS3.regesterCandidateAsync", () => {
      sinon.assert.calledOnce(dpos3Stub.registerCandidateAsync)
      sinon.assert.calledWith(dpos3Stub.registerCandidateAsync,
        CryptoUtils.Uint8ArrayToB64(candidate.address.local.bytes),
        candidate.fee,
        candidate.name,
        candidate.description,
        candidate.website,
        candidate.whitelistLocktimeTier,
      )
    })
  })
})
