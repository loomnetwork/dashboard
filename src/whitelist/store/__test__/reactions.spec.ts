import "mocha"
import { plasmaModuleStub, feedbackModuleStub } from "@/dpos/store/__test__/_helpers"
import { Address, LocalAddress, CryptoUtils, Client } from "loom-js"
import { shallowMount } from "@vue/test-utils"
import { TierID } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import BN from "bn.js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { WhiteListState, DeployerAddress, DeployedContractAddress } from "../types"
import { ITier, IDeployer, IDeployedContract } from "loom-js/dist/contracts/user-deployer-whitelist"
import { sha256 } from "js-sha256"
import sinon from "sinon"
import { TransferRequest } from '@/store/plasma/types';
import { whiteListModule,
  createContract,
  getTierInfo,
  addDeployer,
  getDeployers,
  getDeployedContractAddresses,
  generateSeeds } from "@/whitelist/store/index"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"
import { whiteListReaction } from "../reactions"
import { whiteListModuleStub } from "./_helpers"
import * as mutations from "../mutations"
import { timer } from 'rxjs';

const whiteListstate: WhiteListState = {
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

const address = Address.fromString("default:0x" + "".padEnd(40, "0"))
const addressString = address.local.toString()

describe.only("Whitelist, reactions test", () => {
  const store = getStoreBuilder<DashboardState>().vuexStore()

  before(async () => {
    whiteListModuleStub.createContract.reset()
    store.state.whiteList = whiteListstate
    // @ts-ignore
    whiteListReaction(store)
    store.state.plasma.address = addressString
    whiteListModuleStub.addDeployer.resolves()
  })

  it("should calls whitelistModule.createContract when state.plasma.address mutated", () => {
    sinon.assert.calledOnce(whiteListModuleStub.createContract)
  })

  it.skip("should calls whitelistModule.getTierInfo when state.plasma.userDeployerWhitelist mutated", async () => {
    // @ts-ignore
    store.state.whiteList.userDeployerWhitelist = sinon.createStubInstance(UserDeployerWhitelist)
    await timer(1000).toPromise()
    //console.log(store.state.whiteList.userDeployerWhitelist)
    sinon.assert.calledOnce(whiteListModuleStub.setDefaultTiers)
  })

  it.skip("should calls whiteListModule.getDeployers after whiteListModule.addDeployer on actions", () => {
    sinon.assert.calledOnce(whiteListModuleStub.getDeployers)
  })
})