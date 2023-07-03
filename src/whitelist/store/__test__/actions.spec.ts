import "mocha"
import { plasmaModuleStub, feedbackModuleStub } from "@/dpos/store/__test__/_helpers"
import { Address, LocalAddress, CryptoUtils, Client } from "loom-js"
import { TierID } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import BN from "bn.js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { WhiteListState } from "../types"
import { ITier, IDeployer, IDeployedContract } from "loom-js/dist/contracts/user-deployer-whitelist"
import sinon from "sinon"
import { TransferRequest } from "@/store/plasma/types"
import {
  createContract,
  getTierInfo,
  addDeployer,
  getDeployers,
  getDeployedContractAddresses,
  generateSeeds,
} from "@/whitelist/store/index"
import { whiteListModuleStub } from "./_helpers"

const state: WhiteListState = {
  userDeployerWhitelist: null,
  userDeployersAddress: [],
  tierIDs: [0],
  tiers: [],
  deployedContractAddress: {},
  seed: {
    mnemonic: "",
    publicAddress: "",
  },
}

describe("Whitelist, actions test", () => {
  const address = Address.fromString("default:0x" + "".padEnd(40, "0"))
  const addressString = address.local.toString()
  const client = {} as Client
  const deployerWhitelistStub = sinon.stub(UserDeployerWhitelist)
  const userDeployerWhitelist = sinon.mock(UserDeployerWhitelist.prototype)
  // const whiteListModuleStub = sinon.stub(whiteListModule)
  const deployerWhitelistConstructor = {
    contractAddr: address,
    callerAddr: address,
    client,
  }

  const rootState = {
    plasma: {
      client,
      chainId: "default",
      address: "0x" + "".padEnd(40, "0"),
    },
  }

  describe("createContract", () => {

    before(async () => {
      plasmaModuleStub.getCallerAddress.reset()
      plasmaModuleStub.getCallerAddress.resolves(address)

      // @ts-ignore
      await createContract({ ...{ state }, ...{ rootState } })
    })

    it("calls plasmaModule.getCallerAddress", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getCallerAddress)
    })

    it("calls UserDeployerWhitelist.createAsync", () => {
      const caller = address
      sinon.assert.calledOnce(deployerWhitelistStub.createAsync)
      sinon.assert.calledWith(deployerWhitelistStub.createAsync, rootState.plasma.client, caller)
    })
  })

  describe("getTierInfo", () => {
    let tierDetail

    before(async () => {
      // @ts-ignore
      deployerWhitelistStub.createAsync.reset()
      state.userDeployerWhitelist = new UserDeployerWhitelist(deployerWhitelistConstructor)
      // @ts-ignore
      tierDetail = await getTierInfo({ ...{ state }, ...{ rootState } }, TierID.DEFAULT)
    })

    it("calls userDeployerWhitelist.getTierInfoAsync with correct values", () => {
      userDeployerWhitelist.expects("getTierInfoAsync").once().withArgs(TierID.DEFAULT)
    })

    it("should return correct values after getTierInfoAsync called", () => {
      userDeployerWhitelist.expects("getTierInfoAsync").returned(tierDetail)
    })
  })

  describe("getDeployers", () => {
    const getDeployersAsyncStub = sinon.stub(deployerWhitelistStub.prototype, "getDeployersAsync")

    const deployersResponseDummy: IDeployer[] = [{
      address,
      contracts: [],
      tierId: TierID.DEFAULT,
      inactive: false,
    }]

    before(async () => {
      // @ts-ignore
      deployerWhitelistStub.createAsync.reset()
      state.userDeployerWhitelist = new UserDeployerWhitelist(deployerWhitelistConstructor)

      getDeployersAsyncStub.resolves(deployersResponseDummy)

      // @ts-ignore
      await getDeployers({ ...{ state }, ...{ rootState } })
    })

    it("calls userDeployerWhitelist.getDeployersAsync", () => {
      sinon.assert.calledOnce(getDeployersAsyncStub)
    })

    it("do a setter on mutations", () => {
      sinon.assert.callOrder(
        getDeployersAsyncStub,
        whiteListModuleStub.setUserDeployersAddress,
        whiteListModuleStub.setDefaultDeployedContractAddress,
      )
    })
  })

  describe("addDeployer", () => {
    const addDeployerAsyncStub = sinon.stub(deployerWhitelistStub.prototype, "addDeployerAsync")

    const iTiersDummy: ITier = {
      tierId: TierID.DEFAULT,
      fee: new BN(0),
      name: "DEFAULT",
    }

    const payloadDummy: TransferRequest = {
      symbol: "LOOM",
      weiAmount: iTiersDummy.fee,
      to: addressString,
    }

    const deployAddress = new Address(rootState.plasma.client.chainId, LocalAddress.fromHexString(addressString))

    before(async () => {
      plasmaModuleStub.approve.reset()
      plasmaModuleStub.getCallerAddress.reset()
      plasmaModuleStub.getCallerAddress.resolves(address)

      deployerWhitelistStub.createAsync.reset()
      deployerWhitelistStub.createAsync.resolves(new UserDeployerWhitelist(deployerWhitelistConstructor))

      // @ts-ignore
      await addDeployer({ ...{ state }, ...{ rootState } }, { deployer: addressString, tier: iTiersDummy })
    })

    it("calls plasmaModule.approve", () => {
      sinon.assert.calledOnce(plasmaModuleStub.approve)
      sinon.assert.calledWith(plasmaModuleStub.approve, payloadDummy)
    })

    it("calls UserDeployerWhitelist.addDeployerAsync with correct values", () => {
      sinon.assert.calledOnce(addDeployerAsyncStub)
      sinon.assert.calledWith(addDeployerAsyncStub, deployAddress)
    })

    it("calls whiteListModule.getDeployers", () => {
      sinon.assert.calledOnce(whiteListModuleStub.getDeployers)
    })

    it("notifies feedback modules", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        plasmaModuleStub.approve,
        feedbackModuleStub.setStep,
        addDeployerAsyncStub,
        whiteListModuleStub.getDeployers,
        feedbackModuleStub.showSuccess,
        feedbackModuleStub.endTask,
      )
    })
  })

  describe("getDeployedContractAddresses", () => {
    const getDeployedContractsAsyncStub = sinon.stub(deployerWhitelistStub.prototype, "getDeployedContractsAsync")

    const deployedContract: IDeployedContract[] = [{
      address,
    }]

    const contractAddresses = {
      deployerAddress: addressString,
      deployedContractAddress: [addressString],
    }

    before(async () => {
      getDeployedContractsAsyncStub.resolves(deployedContract)

      // @ts-ignore
      await getDeployedContractAddresses({ ...{ state }, ...{ rootState } }, { deployerAddress: address })
    })

    it("calls UserDeployerWhitelist.getDeployedContractsAsync", () => {
      sinon.assert.calledOnce(getDeployedContractsAsyncStub)
      sinon.assert.calledWith(getDeployedContractsAsyncStub, address)
    })

    it("calls whiteListModule.setDeployedContractAddress", () => {
      sinon.assert.calledOnce(whiteListModuleStub.setDeployedContractAddress)
      sinon.assert.calledWith(whiteListModuleStub.setDeployedContractAddress, contractAddresses)
    })
  })

  describe("generateSeeds", () => {
    const cryptoUtilsStub = sinon.stub(CryptoUtils)
    // const generateMnemonicStub = sinon.fake(generateMnemonic)
    // const mnemonicToSeedSyncStub = sinon.stub(mnemonicToSeedSync)

    before(async () => {
      cryptoUtilsStub.Uint8ArrayToB64.reset()
      // @ts-ignore
      await generateSeeds({ ...{ state }, ...{ rootState } })
    })

    it("calls generateMnemonic")

    it("calls mnemonicToSeedSync")

    it("calls CryptoUtils.generatePrivateKeyFromSeed", () => {
      sinon.assert.calledOnce(cryptoUtilsStub.generatePrivateKeyFromSeed)
    })

    it("calls CryptoUtils.Uint8ArrayToB64", () => {
      sinon.assert.calledOnce(cryptoUtilsStub.Uint8ArrayToB64)
    })

    it("calls plasmaModule.getPublicAddrePriaKeyUint8Array", () => {
      sinon.assert.calledOnce(plasmaModuleStub.getPublicAddrePriaKeyUint8Array)
    })

    it("notifies feedback modules", () => {
      sinon.assert.callOrder(
        feedbackModuleStub.setTask,
        feedbackModuleStub.setStep,
        feedbackModuleStub.endTask,
      )
    })
  })
})
