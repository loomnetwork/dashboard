import "mocha"
import { Address, Client } from "loom-js"
import { TierID } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import BN from "bn.js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { WhiteListState, DeployerAddress, DeployedContractAddress } from "../types"
import { ITier } from "loom-js/dist/contracts/user-deployer-whitelist"
import * as mutations from "../mutations"
import { expect } from "chai"

const initialState = (): WhiteListState => {
  return {
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
}

describe("Whitelist, mutations test", () => {
  let whiteListState: WhiteListState
  // 0x0000000000000000000000000000000000000
  const defaultAddress = "default:0x" + "".padEnd(40, "0")

  const deployerWhitelistConstructor = {
    contractAddr: Address.fromString(defaultAddress),
    callerAddr: Address.fromString(defaultAddress),
    client: {} as Client,
  }

  const deployerAddressDummy: DeployerAddress[] = [{
    address: Address.fromString(defaultAddress),
    hex: Buffer.from(defaultAddress).toString("hex"),
    tier: 0,
    base64: Buffer.from(defaultAddress).toString("base64"),
  }]

  const iTiersDummy: ITier[] = [{
    tierId: TierID.DEFAULT,
    fee: new BN(0),
    name: "DEFAULT",
  }]

  before(() => {
    whiteListState = initialState()
  })

  it("setUserDeployerWhitelist", () => {
    const userDeployerWhitelistDummy = new UserDeployerWhitelist(deployerWhitelistConstructor)
    mutations.setUserDeployerWhitelist(whiteListState, userDeployerWhitelistDummy)
    expect(whiteListState.userDeployerWhitelist).to.eql(userDeployerWhitelistDummy)
  })

  it("setUserDeployersAddress", () => {
    mutations.setUserDeployersAddress(whiteListState, deployerAddressDummy)
    expect(whiteListState.userDeployersAddress).to.eql(deployerAddressDummy)
  })

  it("setDefaultTiers", () => {
    mutations.setDefaultTiers(whiteListState, iTiersDummy)
    expect(whiteListState.tiers).to.eql(iTiersDummy)
  })

  it("setDeployedContractAddress", () => {
    const deployerAddress = defaultAddress
    const deployedContractAddress = [defaultAddress]
    mutations.setDeployedContractAddress(whiteListState, { deployerAddress, deployedContractAddress })
    expect(whiteListState.deployedContractAddress[defaultAddress]).to.eql(deployedContractAddress)
  })

  it("setDefaultDeployedContractAddress", () => {
    /// deployedContractAddress = object (which key is address) that contains deployed contract address array
    const deployedContractAddress = { defaultAddress: [defaultAddress] }
    mutations.setDefaultDeployedContractAddress(whiteListState, deployedContractAddress)
    expect(whiteListState.deployedContractAddress).to.eql(deployedContractAddress)
  })
})
