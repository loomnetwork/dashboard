
import { getStoreBuilder } from "vuex-typex"
import { WhiteListState, HasWhiteListState, Tier, DeployerAddress } from "@/store/whitelist/types"
import * as mutations from "./mutations"
import { WhiteListContext } from "./types"
import { Address, LocalAddress } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"

import debug from "debug"
import { plasmaModule } from "../plasma"
const log = debug("whitelist")
import BN from "bn.js"
import { CommonTypedStore } from "../common"

const initialState: WhiteListState = {
  userDeployerWhitelist: null,
  userDeployersAddress: [],
  whiteListContractAddress: null,
  tiers: [
    {
      id: 0,
      fee: 10,
      name: "Tier1",
      enabled: true,
    },
  ],
}
const builder = getStoreBuilder<HasWhiteListState>().module("whiteList", initialState)
const stateGetter = builder.state()

export const whiteListModule = {
  get state() {
    return stateGetter()
  },

  setUserDeployerWhitelist: builder.commit(mutations.setUserDeployerWhitelist),
  setUserDeployersAddress: builder.commit(mutations.setUserDeployersAddress),
  setWhiteListContractAddress: builder.commit(mutations.setWhiteListContractAddress ),
  createUserDeployerWhitelistAsync: builder.dispatch(
    createUserDeployerWhitelistAsync,
  ),
  addDeployerAsync: builder.dispatch(addDeployerAsync),
  getDeployersAsync: builder.dispatch(getDeployersAsync),
  formatDeployersAddress: builder.dispatch(formatDeployersAddress),
}

async function createUserDeployerWhitelistAsync(context: WhiteListContext) {
  const userDeployerWhitelist = await UserDeployerWhitelist.createAsync(
    context.rootState.plasma.client,
    await plasmaModule.getCallerAddress(),
  )
  whiteListModule.setUserDeployerWhitelist(userDeployerWhitelist)
  const contractAddress = await context.rootState.plasma.client.getContractAddressAsync("user-deployer-whitelist")
  whiteListModule.setWhiteListContractAddress(contractAddress!)
}

async function addDeployerAsync(
  context: WhiteListContext,
  payload: { deployer: string, tier: Tier },
) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const deployAddress = new Address(
    context.rootState.plasma.client!.chainId,
    LocalAddress.fromHexString(payload.deployer),
  )
  try {
    const contractAddress = context.state.whiteListContractAddress!.local.toString()
    const approvedResult = await plasmaModule.approve({
      symbol: "loom",
      weiAmount: new BN(context.rootState.plasma.web3!.utils.toWei(payload.tier.fee.toString(), "ether"), 10),
      to: contractAddress})
    log("approved", approvedResult)
  } catch (error) {
    let errorMessage = error.message
    if (!error.message.includes("User denied message signature")) {
      errorMessage = "User denied message signature"
      console.log("Denided...............")

    }
    CommonTypedStore.setErrorMsg(`Error Approving Transaction: ${errorMessage}`)
    return
  }

  let result
  try {
    // TODO: update this to pass tier if we have more tier
    result = await userDeployerWhitelist!.addDeployerAsync(deployAddress)
    log("addDeployerAsync result", result)
    await whiteListModule.getDeployersAsync()
  } catch (error) {
    CommonTypedStore.setErrorMsg(`Error Adding a key: ${error.message}`)
    return
  }
}

async function getDeployersAsync(context: WhiteListContext) {
  const chainId = context.rootState.plasma.chainId
  const loomAddressString = context.rootState.plasma.address
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const loomAddress = Address.fromString(`${chainId}:${loomAddressString}`)
  let result
  let deployerAddresses
  try {
    result = await userDeployerWhitelist!.getDeployersAsync(
      loomAddress,
    )
    log("getDeployersAsync result", result)
    deployerAddresses = await whiteListModule.formatDeployersAddress(result)
    log("deployerAddresses", deployerAddresses)

  } catch (error) {
      console.error(error)

    // if (!error.data.includes("not found")) {
    //   // if `not found` = have no deployer => don't show error
    //   // else = other internal error => show error
      // console.error(error.data)
    // }
      deployerAddresses = []
  }
  whiteListModule.setUserDeployersAddress(deployerAddresses)
}

/**
 * [
 * { "wrappers_": null,
 * "arrayIndexOffset_": -1,
 * "array": [
 * [ "default", { "0": 132, "1": 46, "2": 166, "3": 34, "4": 253, "5": 231, "6": 30, "7": 128, "8": 83, "9": 175, "10": 91, "11": 212, "12": 28, "13": 74, "14": 38, "15": 134, "16": 64, "17": 197, "18": 153, "19": 214 } ],
 * []
 * ],
 * "pivot_": 1.7976931348623157e+308,
 * "convertedFloatingPointFields_": {} },
 * { "wrappers_": null, "arrayIndexOffset_": -1, "array": [ [ "default", { "0": 74, "1": 40, "2": 226, "3": 212, "4": 185, "5": 142, "6": 187, "7": 166, "8": 102, "9": 49, "10": 176, "11": 67, "12": 255, "13": 191, "14": 245, "15": 98, "16": 174, "17": 141, "18": 204, "19": 30 } ], [] ], "pivot_": 1.7976931348623157e+308, "convertedFloatingPointFields_": {} }
 * ]
 *
*/
//
function formatDeployersAddress(context: WhiteListContext, deployers: []) {
  const formattedDeployersAddress: DeployerAddress[] = []
  deployers.forEach((deployer) => {
    //  @ts-ignore
    let array = deployer.array[0]
    const deployerAddress = new Address(
          array[0],
          new LocalAddress(array[1]))
    // TODO: fix this when get tier from contract
    formattedDeployersAddress.push({
      address: deployerAddress,
      hex: deployerAddress.local.toString(),
      tier: 0,
      base64: Buffer.from(deployerAddress.local.toString().split("x")[1], "hex").toString("base64"),
      defaultFormat: "hex",
    })
  })
  return formattedDeployersAddress
}
