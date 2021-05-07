import "mocha"
import { PlasmaState, PlasmaConfig } from "@/store/plasma/types"
import { Address } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { WhiteListState } from "../types"
import sinon from "sinon"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"
import { whiteListReaction } from "../reactions"
import { whiteListModuleStub } from "./_helpers"
import { timer } from "rxjs"
import BN from "bn.js"

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

const initialState: PlasmaState = {
  networkId: "",
  chainId: "",
  endpoint: "",
  historyUrl: "",
  // todo move these out of the state
  client: null, // createClient(configs.us1),
  web3: null,
  provider: null,
  ethersProvider: null,
  signer: null,
  address: "",
  appId: {
    private:
      "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
    public: "",
    address: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
  },
  coins: {
    LOOM: {
      balance: new BN("0"),
      loading: false,
      decimals: 18,
    },
    ETH: {
      balance: new BN("0"),
      loading: false,
      decimals: 18,
    },
    // bnb: {
    //   balance: new BN("0"),
    //   loading: false,
    // },
  },
  selectedToken: "",
  blockExplorer: "",
  loomGamesEndpoint: "",
  history: [],
}

const address = Address.fromString("default:0x" + "".padEnd(40, "0"))
const addressString = address.local.toString()

describe("Whitelist, reactions test", () => {
  const store = getStoreBuilder<DashboardState>().vuexStore()

  before(async () => {
    whiteListModuleStub.createContract.reset()
    store.state.whiteList = whiteListstate
    store.state.plasma = initialState
    // @ts-ignore
    whiteListReaction(store)
    store.state.plasma.address = addressString
  })

  it("should calls whitelistModule.createContract when state.plasma.address mutated", () => {
    sinon.assert.calledOnce(whiteListModuleStub.createContract)
  })

  it.skip("should calls whitelistModule.getTierInfo when state.plasma.userDeployerWhitelist mutated", async () => {
    // @ts-ignore
    store.state.whiteList.userDeployerWhitelist = sinon.createStubInstance(UserDeployerWhitelist)
    await timer(1000).toPromise()
    // console.log(store.state.whiteList.userDeployerWhitelist)
    sinon.assert.calledOnce(whiteListModuleStub.setDefaultTiers)
  })

  it.skip("should calls whiteListModule.getDeployers after whiteListModule.addDeployer on actions", () => {
    whiteListModuleStub.addDeployer.resolves()
    sinon.assert.calledOnce(whiteListModuleStub.getDeployers)
  })
})
