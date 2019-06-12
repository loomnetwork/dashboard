import { getStoreBuilder } from "vuex-typex"
import {
  WhiteListState,
  HasWhiteListState,
  Tier,
  DeployerAddress,
  DeployerAddressResponse,
} from "@/store/whitelist/types"
import * as mutations from "./mutations"
import { WhiteListContext } from "./types"
import { Address, LocalAddress } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"

import debug from "debug"
import { plasmaModule } from "../plasma"
const log = debug("whitelist")
import BN from "bn.js"
import { CommonTypedStore } from "../common"
import { i18n } from "../../i18n"

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
const builder = getStoreBuilder<HasWhiteListState>().module(
  "whiteList",
  initialState,
)
const stateGetter = builder.state()

export const whiteListModule = {
  get state() {
    return stateGetter()
  },

  setUserDeployerWhitelist: builder.commit(mutations.setUserDeployerWhitelist),
  setUserDeployersAddress: builder.commit(mutations.setUserDeployersAddress),
  setWhiteListContractAddress: builder.commit(
    mutations.setWhiteListContractAddress,
  ),
  createUserDeployerWhitelistAsync: builder.dispatch(
    createUserDeployerWhitelistAsync,
  ),
  addDeployerAsync: builder.dispatch(addDeployerAsync),
  getDeployersAsync: builder.dispatch(getDeployersAsync),
  formatDeployersAddress: builder.dispatch(formatDeployersAddress),
}

async function createUserDeployerWhitelistAsync(context: WhiteListContext) {
  const userDeployerWhitelist = await UserDeployerWhitelist.createAsync(
    context.rootState.plasma.client!,
    await plasmaModule.getCallerAddress(),
  )
  whiteListModule.setUserDeployerWhitelist(userDeployerWhitelist)
  const contractAddress = await context.rootState.plasma.client!.getContractAddressAsync(
    "user-deployer-whitelist",
  )
  whiteListModule.setWhiteListContractAddress(contractAddress!)
}

async function addDeployerAsync(
  context: WhiteListContext,
  payload: { deployer: string; tier: Tier },
) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const deployAddress = new Address(
    context.rootState.plasma.client!.chainId,
    LocalAddress.fromHexString(payload.deployer),
  )
  try {
    const contractAddress = context.state.whiteListContractAddress!.local.toString()
    const approvedResult = await plasmaModule.approve({
      symbol: "LOOM",
      weiAmount: new BN(
        context.rootState.plasma.web3!.utils.toWei(
          payload.tier.fee.toString(),
          "ether",
        ),
        10,
      ),
      to: contractAddress,
    })
    log("approved", approvedResult)
  } catch (error) {
    let errorMessage = error.message
    const userDeniedSignTx = i18n.t("messages.user_denied_sign_tx").toString()
    if (!error.message.includes(userDeniedSignTx)) {
      errorMessage = userDeniedSignTx
    }
    CommonTypedStore.setErrorMsg(
      i18n
        .t("messages.transaction_apprv_err_tx", { msg: errorMessage })
        .toString(),
    )
    return
  }

  let result
  try {
    // TODO: update this to pass tier if we have more tier
    result = await userDeployerWhitelist!.addDeployerAsync(deployAddress)
    log("addDeployerAsync result", result)
    await whiteListModule.getDeployersAsync()
    await plasmaModule.refreshBalance("LOOM")
    CommonTypedStore.setSuccessMsg(
      i18n.t("messages.add_deployer_addr_success_tx").toString(),
    )
  } catch (error) {
    CommonTypedStore.setErrorMsg(
      i18n.t("messages.add_key_err_tx", { msg: error.message }).toString(),
    )
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
    result = await userDeployerWhitelist!.getDeployersAsync(loomAddress)
    deployerAddresses = await whiteListModule.formatDeployersAddress(result)
  } catch (error) {
    console.error(error)
    deployerAddresses = []
  }
  whiteListModule.setUserDeployersAddress(deployerAddresses)
}

function formatDeployersAddress(
  context: WhiteListContext,
  deployers: DeployerAddressResponse[],
) {
  const formattedDeployersAddress: DeployerAddress[] = []
  deployers.forEach((deployer) => {
    const deployerAddress = deployer.address
    formattedDeployersAddress.push({
      address: deployerAddress,
      hex: deployerAddress.local.toString(),
      tier: deployer.tierId,
      base64: Buffer.from(
        deployerAddress.local.toString().split("x")[1],
        "hex",
      ).toString("base64"),
      defaultFormat: "hex",
    })
  })
  return formattedDeployersAddress
}
