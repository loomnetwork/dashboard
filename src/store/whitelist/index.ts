
import { getStoreBuilder } from "vuex-typex"
import { WhiteListState, HasWhiteListState } from "@/store/whitelist/types"
import * as mutations from "./mutations"
import { WhiteListContext } from "./types"
import { Address, LocalAddress } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"

import debug from "debug"
import { plasmaModule } from "../plasma"
const log = debug("whitelist")
import BN from "bn.js"

const initialState: WhiteListState = {
  userDeployerWhitelist: null,
  userDeployersAddress: [],
  whiteListContractAddress: null,
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
}

async function createUserDeployerWhitelistAsync(context: WhiteListContext) {
  const chainId = context.rootState.plasma.chainId
  const address = context.rootState.plasma.address
  const loomAddress = Address.fromString(`${chainId}:${address}`)
  log("account", address)
  const userDeployerWhitelist = await UserDeployerWhitelist.createAsync(
    context.rootState.plasma.client,
    await plasmaModule.getCallerAddress(),
  )
  log("userDeployerWhitelist", userDeployerWhitelist)
  whiteListModule.setUserDeployerWhitelist(userDeployerWhitelist)
  const contractAddress = await context.rootState.plasma.client.getContractAddressAsync("user-deployer-whitelist")
  log("contractAddress", contractAddress)
  whiteListModule.setWhiteListContractAddress(contractAddress!)
}

// TODO: update this if we have more tier
async function addDeployerAsync(
  context: WhiteListContext,
  payload: { deployer: string },
) {
  log("payload.deployer", payload.deployer)
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const deployAddress = new Address(
    context.rootState.plasma.client!.chainId,
    LocalAddress.fromHexString(payload.deployer),
  )
  log("deployAddress", deployAddress)
  try {
    log("loom balance", plasmaModule.state.coins.loom)
    const contractAddress = context.state.whiteListContractAddress!.local.toString()
    log("contractAddress toString", contractAddress)
    const approvedResult = await plasmaModule.approve({symbol: "loom", weiAmount: new BN(context.rootState.plasma.web3!.utils.toWei("30", "ether"), 10), to: contractAddress})
    log("approvedResult", approvedResult)
    const allowanceResult =  await plasmaModule.allowance({token: "loom", spender: contractAddress})
    log("allowanceResult", allowanceResult)

  } catch (error) {
    console.log("===========")
    console.error("approve error", error)
    console.log("===========")
    return
  }
  let result
  try {
    result = await userDeployerWhitelist!.addDeployerAsync(deployAddress)
    log("addDeployerAsync result", result)
    await whiteListModule.getDeployersAsync()
  } catch (error) {
    console.log("===========")
    console.error("addDeployerAsync error", error)
    console.log("===========")
  }
}

async function getDeployersAsync(context: WhiteListContext) {
  const chainId = context.rootState.plasma.chainId
  const loomAddressString = context.rootState.plasma.address
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const loomAddress = Address.fromString(`${chainId}:${loomAddressString}`)
  console.log("loomAddress", loomAddress)
  let result
  try {
    result = await userDeployerWhitelist!.getDeployersAsync(
      loomAddress,
    )
  } catch (error) {
    console.log("===============")
    console.error(error)
    console.log("===============")
    result = []
  }
  log("getDeployersAsync result", result)
  whiteListModule.setUserDeployersAddress(result)
}
