import "mocha"
import sinon from 'sinon';
import { feedbackModuleStub, plasmaModuleStub } from '@/dpos/store/__test__/_helpers';
import { Address } from 'loom-js';
import { AssetsState } from '../types';
import Web3 from "web3"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import packAddresses from "@/data/ZBGPackAddresses.json"
import { Contract } from "web3-eth-contract"
import { TransactionObject } from "@/contracts/types/web3-contracts/types"
import { assetsModule, transferCards } from '..';

const initialState = (): AssetsState => {
  return {
    packsContract: {},
    cardContract: null,
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
}

describe("Transfers assets", () => {
  describe("transfering cards success", () => {
    const address = Address.fromString("default:0x" + "".padEnd(40, "0"))
    const addressString = address.local.toString()
    const cardIds = ["0"]
    const amounts = [1]
    const receiver = addressString

    const state = initialState()
    const rootState = {
      plasma: {
        address: addressString,
      },
    }
    state.cardContract = {
      methods: {
        batchTransferFrom: () => {}
      }
    } as Contract as MigratedZBGCard

    const batchTransferFromStub = sinon.stub(state.cardContract.methods, "batchTransferFrom")
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
    it("calls batchTransferFrom", () => {
      sinon.assert.calledOnce(batchTransferFromStub)
      sinon.assert.calledWith(batchTransferFromStub, addressString, receiver, cardIds, amounts)
    })
    it("calls send", () => {
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
})