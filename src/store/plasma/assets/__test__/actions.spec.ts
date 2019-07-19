import "mocha"
import { expect } from "chai"
import sinon from "sinon"
import { feedbackModuleStub, plasmaModuleStub } from "@/dpos/store/__test__/_helpers"
import { Address } from "loom-js"
import { AssetsState } from "../types"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { Contract } from "web3-eth-contract"
import { assetsModule, checkCardBalance, checkPackBalance, transferCards, transferPacks } from ".."
import { PACKS_NAME } from "../reactions"

const state: AssetsState = {
  packsContract: {},
  cardContract: {
    methods: {
      batchTransferFrom: Function(),
      tokensOwned: Function(),
    },
  } as Contract as MigratedZBGCard,
  cardBalance: [],
  packBalance: [],
  cardToTransferSelected: {
    id: "0",
    amount: 0,
    display_name: "default",
    image: "default",
    title: "default",
    variant: "default",
    variation: "default",
    mould_type: "default",
    element: "default",
    originalID: "default",
  },
  packToTransferSelected: {
    type: "Booster",
    amount: 0,
  },
  allCardsToTransferSelected: {
    edition: "none",
    cards: [],
    amount: 0,
  },
}

PACKS_NAME.forEach((type) => {
  state.packsContract[type] = {
    methods: {
      transfer: Function(),
      balanceOf: Function(),
    },
  }
})

const address = Address.fromString("default:0x" + "".padEnd(40, "0"))
const addressString = address.local.toString()
const rootState = {
  plasma: {
    address: addressString,
  },
}

describe("Transfers assets", () => {
  describe("checking card balance", () => {
    const tokensOwnedStub = sinon.stub(state.cardContract!.methods, "tokensOwned")
    const callStub = sinon.stub().returns({
      balances: ["1", "2", "3"],
      indexes: ["270", "430", "1410"],
    })
    const setCardBalanceStub = sinon.stub(assetsModule, "setCardBalance")

    before(async () => {
      plasmaModuleStub.getCallerAddress.reset()
      plasmaModuleStub.getCallerAddress.resolves(address)
      // @ts-ignore
      tokensOwnedStub.returns({
        call: callStub,
      })
      // @ts-ignore
      await checkCardBalance({ ...{state}, ...{rootState} })
    })

    it("calls plasmaModule.getCallerAddress", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getCallerAddress)
    })
    it("calls cardContract.tokensOwned", () => {
      sinon.assert.calledOnce(tokensOwnedStub)
      sinon.assert.calledWith(tokensOwnedStub, rootState.plasma.address)
    })
    it("calls TransactionObject.call", () => {
      sinon.assert.calledOnce(callStub)
      sinon.assert.calledWith(callStub, { from: addressString })
    })
    it("calls assetsModule.setCardBalanceStub", () => {
      sinon.assert.calledOnce(setCardBalanceStub)
    })
  })

  describe("transfering cards success", () => {
    const cardIds = ["0"]
    const amounts = [1]
    const receiver = addressString

    const batchTransferFromStub = sinon.stub(state.cardContract!.methods, "batchTransferFrom")
    const sendStub = sinon.stub().returns({ transactionHash: "xxx" })
    const checkCardBalanceStub = sinon.stub(assetsModule, "checkCardBalance")

    before(async () => {
      plasmaModuleStub.getCallerAddress.reset()
      plasmaModuleStub.getCallerAddress.resolves(address)
      // @ts-ignore
      batchTransferFromStub.returns({
        send: sendStub,
      })
      checkCardBalanceStub.resolves()
      // @ts-ignore
      await transferCards({ ...{state}, ...{rootState} }, { cardIds, amounts, receiver })
    })

    it("calls plasmaModule.getCallerAddress", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getCallerAddress)
    })
    it("calls cardContract.batchTransferFrom", () => {
      sinon.assert.calledOnce(batchTransferFromStub)
      sinon.assert.calledWith(batchTransferFromStub, addressString, receiver, cardIds, amounts)
    })
    it("calls TransactionObject.send", () => {
      sinon.assert.calledOnce(sendStub)
      sinon.assert.calledWith(sendStub, { from: addressString })
    })
    it("calls assetsModule.checkCardBalance", () => {
      sinon.assert.calledOnce(checkCardBalanceStub)
    })
    it("notifies feedback modules", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        feedbackModuleStub.setStep,
        plasmaModuleStub.getCallerAddress,
        batchTransferFromStub,
        sendStub,
        checkCardBalanceStub,
        feedbackModuleStub.endTask,
        feedbackModuleStub.showSuccess,
      )
    })
  })

  describe("checking pack balance", () => {
    const balanceOfStubs = []
    const callStub = sinon.stub().returns({})
    const setPackBalanceStub = sinon.stub(assetsModule, "setPackBalance")

    before(async () => {
      plasmaModuleStub.getCallerAddress.reset()
      plasmaModuleStub.getCallerAddress.resolves(address)
      PACKS_NAME.forEach((type) => {
        balanceOfStubs[type] = sinon.stub(state.packsContract[type].methods, "balanceOf")
        balanceOfStubs[type].returns({
          call: callStub,
        })
      })
      // @ts-ignore
      await checkPackBalance({ ...{state}, ...{rootState} })
    })

    it("calls plasmaModule.getCallerAddress", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getCallerAddress)
    })
    it("calls packsContract.balanceOf of each type", () => {
      PACKS_NAME.forEach((type) => {
        sinon.assert.calledOnce(balanceOfStubs[type])
        sinon.assert.calledWith(balanceOfStubs[type], rootState.plasma.address)
      })
    })
    it("calls .call", () => {
      PACKS_NAME.forEach((type) => {
        sinon.assert.calledWith(callStub, { from: addressString })
      })
      expect(callStub.callCount).to.equal(PACKS_NAME.length)
    })
    it("calls assetsModule.setCardBalanceStub", () => {
      sinon.assert.calledOnce(setPackBalanceStub)
    })
  })

  describe("transfering packs success", () => {
    const packType = "booster"
    const amount = 1
    const receiver = addressString

    const transferStub = sinon.stub(state.packsContract[packType].methods, "transfer")
    const sendStub = sinon.stub().returns({})
    const checkPackBalanceStub = sinon.stub(assetsModule, "checkPackBalance")

    before(async () => {
      plasmaModuleStub.getCallerAddress.reset()
      plasmaModuleStub.getCallerAddress.resolves(address)
      // @ts-ignore
      transferStub.returns({
        send: sendStub,
      })
      checkPackBalanceStub.resolves()
      // @ts-ignore
      await transferPacks({ state }, { packType, amount, receiver })
    })

    it("calls plasmaModule.getCallerAddress", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getCallerAddress)
    })
    it("calls cardContract.batchTransferFrom", () => {
      sinon.assert.calledOnce(transferStub)
      sinon.assert.calledWith(transferStub, receiver, amount)
    })
    it("calls TransactionObject.send", () => {
      sinon.assert.calledOnce(sendStub)
      sinon.assert.calledWith(sendStub, { from: addressString })
    })
    it("calls assetsModule.checkCardBalance", () => {
      sinon.assert.calledOnce(checkPackBalanceStub)
    })
    it("notifies feedback modules", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        feedbackModuleStub.setStep,
        plasmaModuleStub.getCallerAddress,
        transferStub,
        sendStub,
        checkPackBalanceStub,
        feedbackModuleStub.endTask,
        feedbackModuleStub.showSuccess,
      )
    })
  })
})
