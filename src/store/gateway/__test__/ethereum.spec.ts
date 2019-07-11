import { Funds } from "@/types"
import { GatewayState } from "@/store/gateway/types"
import BN from "bn.js"
import Web3 from "web3"
import sinon from "sinon"
import production from "@/config/production"
import { EthereumGatewayAdapter } from "@/store/gateway/types"
import { ERC20GatewayAdapter, ethereumDeposit, EthereumGateways as Gateways} from "../ethereum"
import * as EthereumGateways from "../ethereum"
import Storage from "@/services/storage"
import { tokenService } from "@/services/TokenService"
import { Address } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

function initialState(): GatewayState {
  return {
    multisig: false,
    chains: [],
    mapping: null,
    withdrawalReceipts: null,
    pendingTransactions: [],
    showDepositForm: false,
    showDepositApproved: false,
    showDepositConfirmed: false,
    showWithdrawForm: false,
    showWithdrawProgress: false,
    transferRequest: {
      type: "",
      chain: "",
      token: "",
    },
    withdrawStates: [
      { text: "Checking for pre-existing receipts...", isComplete: false },
      { text: "Depositing to Plasmachain Gateway...", isComplete: false },
      { text: "Awaiting Oracle signature...", isComplete: false },
      { text: "Withdrawing to your Ethereum account...", isComplete: false },
    ],
    withdrawStateIdx: 0,
    maybeRelentlessUser: null,
    checkMarketplaceURL: "",
    gateways: {
      ethereum: null,
      plasma: null,
    },
  }
}

describe.only("Ethereum Gateway actions", () => {
  const stubProvider = sinon.createStubInstance(Web3.providers.HttpProvider)
  const web3 = new Web3(stubProvider)
  const state = initialState()
  const rootState = Object.assign({}, production)
  const tokenData = {
    symbol: "",
    ethereum: "",
    plasma: "",
    binance: "",
    decimals: 18,
  }
  // describe("Ethereum deposit", () => {

  //   const gatewayStub = sinon.createStubInstance(ERC20GatewayAdapter)
  //   before(async () => {

  //     const funds: Funds = {
  //       chain: "ethereum",
  //       symbol: "LOOM",
  //       weiAmount: new BN("0"),
  //     }

  //     // @ts-ignore
  //     await ethereumDeposit({state} , funds)
  //   })

  //   it("calls ERC20GatewayAdapter.deposit", () => {
  //     sinon.assert.calledOnce(gatewayStub.deposit)
  //   })

  // })

  describe("Ethereum withdraw", () => {
    const context = {...{state}, ...{rootState}}
    //  @ts-ignore
    const receipt: IWithdrawalReceipt = {
      tokenContract: Address.fromString(":0x".padEnd(44, "0")),
    }

    afterEach(() => {
      sinon.restore()
    })

    it("logs error when no receipt is present in state", async () => {
      const spy = sinon.spy()
      sinon.replace(console, "error", spy)
      // @ts-ignore
      await EthereumGateways.ethereumWithdraw(context, "LOOM")
      sinon.assert.calledWith(spy, "no withdraw receipt in state")
    })

    it("logs error if tokenInfo == null", async () => {
      const spy = sinon.spy()
      sinon.replace(console, "error", spy)
      state.withdrawalReceipts = receipt
      const tokenFromAddressStub = sinon.stub(tokenService, "tokenFromAddress")
      tokenFromAddressStub.returns(null)
      // @ts-ignore
      await EthereumGateways.ethereumWithdraw(context, "LOOM")
      sinon.assert.calledWith(spy, "token contract address in receipt unknown ")
    })

    // it("calls tokenService.tokenFromAddress", async () => {
    //   context.state.withdrawalReceipts = receipt
    //   const tokenFromAddressSpy = sinon.spy()
    //   sinon.replace(tokenService, "tokenFromAddress", tokenFromAddressSpy)
    //   // @ts-ignore
    //   await EthereumGateways.ethereumWithdraw(context, "LOOM")
    //   sinon.assert.calledOnce(tokenFromAddressSpy)
    // })

    it("calls gateway.withdrawal", async () => {
      const spy = sinon.spy()
      const GatewaysMock = sinon.mock(Gateways)
      // @ts-ignore
      context.state.gateways.ethereum = {
        get: () => {
          return { withdraw: spy }
        },
      }
      context.state.withdrawalReceipts = receipt
      const tokenFromAddressStub = sinon.stub(tokenService, "tokenFromAddress")
      tokenFromAddressStub.returns(tokenData)
      const storageMock = sinon.mock(Storage)

      // @ts-ignore
      await EthereumGateways.ethereumWithdraw(context, "LOOM", true)
      storageMock.expects("set").once().withArgs("pendingWithdrawal", true)
      sinon.assert.calledOnce(spy)

    })

  })

})
