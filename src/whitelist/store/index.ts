import debug from "debug"

import { getStoreBuilder } from "vuex-typex"

import { Address, LocalAddress, CryptoUtils } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { ITier } from "loom-js/dist/contracts/user-deployer-whitelist"
import { TierID } from "loom-js/dist/proto/user_deployer_whitelist_pb"
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import { sha256 } from "js-sha256"

import { i18n } from "@/i18n"
import { plasmaModule } from "@/store/plasma"
import { feedbackModule } from "@/feedback/store"

import {
  WhiteListState,
  HasWhiteListState,
  DeployerAddress,
  DeployerAddressResponse,
  WhiteListContext,
} from "@/whitelist/store/types"
import * as mutations from "./mutations"

const log = debug("whitelist")

const initialState: WhiteListState = {
  userDeployerWhitelist: null,
  userDeployersAddress: [],
  tierIDs: [0], // TODO: update this if we have more tier: add more tier ID
  tiers: [],
  seed: {
    mnemonic: "",
    publicAddress: "",
  },
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
  setDefaultTiers: builder.commit(mutations.setDefaultTiers),

  createContract: builder.dispatch(createContract),
  addDeployer: builder.dispatch(addDeployer),
  getDeployers: builder.dispatch(getDeployers),
  getTierInfo: builder.dispatch(getTierInfo),
  generateSeeds: builder.dispatch(generateSeeds),
}

/**
 *
 * @param context
 */
async function createContract(context: WhiteListContext) {
  const client = context.rootState.plasma.client!
  const caller = await plasmaModule.getCallerAddress()
  const contract = await UserDeployerWhitelist.createAsync(client, caller)
  context.state.userDeployerWhitelist = contract
}

/**
 *
 * @param context
 * @param payload
 */
async function getTierInfo(
  context: WhiteListContext,
  payload: { tierID: TierID },
) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  let tierDetail
  try {
    tierDetail = await userDeployerWhitelist!.getTierInfoAsync(payload.tierID)
  } catch (error) {
    log("getTierInfoAsync error")
    console.error(error)
  }
  return tierDetail
}

/**
 *
 * @param context
 * @param payload
 */
async function addDeployer(
  context: WhiteListContext,
  payload: { deployer: string; tier: ITier },
) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist!
  const deployAddress = new Address(
    context.rootState.plasma.client!.chainId,
    LocalAddress.fromHexString(payload.deployer),
  )
  feedbackModule.setTask("Adding deployer key")
  try {
    const contractAddress = userDeployerWhitelist.address.local.toString()
    const approvedResult = await plasmaModule.approve({
      symbol: "LOOM",
      weiAmount: payload.tier.fee,
      to: contractAddress,
    })
    log("approved", approvedResult)
  } catch (error) {
    feedbackModule.endTask()
    return
  }

  let result
  try {
    feedbackModule.setStep("Adding new deployer")
    // TODO: update this if we have more tier: pass tier
    result = await userDeployerWhitelist.addDeployerAsync(deployAddress)
    log("addDeployerAsync result", result)
    await whiteListModule.getDeployers()
    feedbackModule.showSuccess(
      i18n.t("messages.add_deployer_addr_success_tx").toString(),
    )
  } catch (error) {
    log("addDeployerAsync error")
    console.error(error)
    let errorMessage = error.message
    if (error.message.includes("User denied message")) {
      errorMessage = i18n.t("messages.user_denied_sign_tx").toString()
    } else if (error.message.includes("deployer already exists")) {
      errorMessage = i18n.t("messages.deployer_already_exists").toString()
    }
    feedbackModule.showError(
      i18n.t("messages.add_key_err_tx", { msg: errorMessage }).toString(),
    )
  } finally {
    feedbackModule.endTask()
  }
}

/**
 *
 * @param context
 */
async function getDeployers(context: WhiteListContext) {
  const chainId = context.rootState.plasma.chainId
  const accountString = context.rootState.plasma.address
  const contract = context.state.userDeployerWhitelist!
  const accountAddr = Address.fromString(`${chainId}:${accountString}`)
  let result
  let deployerAddresses
  try {
    result = await contract.getDeployersAsync(accountAddr)
    deployerAddresses = formatDeployersAddress(result)
  } catch (error) {
    console.error(error)
    deployerAddresses = []
  }
  mutations.setUserDeployersAddress(context.state, deployerAddresses)
}

/**
 * helper function to format deployer info
 * @param deployers
 */
function formatDeployersAddress(
  deployers: DeployerAddressResponse[],
): DeployerAddress[] {
  return deployers.map((deployer) => {
    const deployerAddress = deployer.address
    return {
      address: deployerAddress,
      hex: deployerAddress.local.toString(),
      tier: deployer.tierId,
      base64: Buffer.from(
        deployerAddress.local.toString().split("x")[1],
        "hex",
      ).toString("base64"),
    }
  })
}

/**
 *
 * @param context
 */
async function generateSeeds(context: WhiteListContext) {
  feedbackModule.setTask("New key")
  feedbackModule.setStep("Generating new key")

  const mnemonic = generateMnemonic()
  const seed = mnemonicToSeedSync(mnemonic)
  const privateKeyUint8ArrayFromSeed = CryptoUtils.generatePrivateKeyFromSeed(new Uint8Array(sha256.array(seed)))
  const privateKeyB64 = CryptoUtils.Uint8ArrayToB64(privateKeyUint8ArrayFromSeed)
  const publicKey = await plasmaModule.getPublicAddrePriaKeyUint8Array({ privateKey: privateKeyUint8ArrayFromSeed })

  feedbackModule.endTask()

  context.state.seed.mnemonic = mnemonic
  context.state.seed.publicAddress = publicKey
}