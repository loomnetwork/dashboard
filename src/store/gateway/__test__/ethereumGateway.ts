import mocha from "mocha"
import sinon from "sinon"
import { assert, expect } from "chai"
import Web3 from "web3"
import { Address } from "loom-js"

import { ethereumModule } from "@/store/ethereum"
import * as EthereumGatewaysContent from "../ethereum"

import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

describe("Ethereum Gateway Service", () => {
  // const store = getStoreBuilder<DashboardState>().vuexStore()
  // describe("Initialization", () => {
  //   const stubProvider = sinon.createStubInstance(Web3.providers.HttpProvider)
  //   const web3 = new Web3(stubProvider)
  //   const addresses = {
  //     mainGateway: "0x" + "".padEnd(40, "0"),
  //     loomGateway: "0x" + "".padEnd(40, "0"),
  //   }

  //   let multisig = true
  //   it("Should return an instance that is not null", async () => {
  //     const instance = await EthereumGatewaysContent.init(web3, addresses, multisig)
  //     expect(typeof instance).to.not.equal(null)
  //   })

  //   it("Should not initialize vmc contract if multisig == false", async () => {
  //     multisig = false
  //     const instance = await EthereumGatewaysContent.init(web3, addresses, multisig)
  //     expect(instance.vmc).to.equal(null)
  //   })

  //   it("Should initialize vmc contract if multisig == true", async () => {
  //     multisig = true
  //     const instance = await EthereumGatewaysContent.init(web3, addresses, multisig)
  //     expect(instance).to.not.equal(null)
  //   })

  // })

})
