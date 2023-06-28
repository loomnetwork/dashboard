import debug from "debug"

import { getStoreBuilder } from "vuex-typex"

import { Address, LocalAddress, CryptoUtils } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"
import { ITier, IDeployedContract } from "loom-js/dist/contracts/user-deployer-whitelist"
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
  deployedContractAddress: {},
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
  setDeployedContractAddress: builder.commit(mutations.setDeployedContractAddress),
  setDefaultDeployedContractAddress: builder.commit(mutations.setDefaultDeployedContractAddress),

  createContract: builder.dispatch(createContract),
  addDeployer: builder.dispatch(addDeployer),
  getDeployers: builder.dispatch(getDeployers),
  getTierInfo: builder.dispatch(getTierInfo),
  generateSeeds: builder.dispatch(generateSeeds),
  getDeployedContractAddresses: builder.dispatch(getDeployedContractAddresses),
}

/**
 *
 * @param context
 */
export async function createContract(context: WhiteListContext) {
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
export async function getTierInfo(
  context: WhiteListContext,
  payload: { tierID: TierID },
) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  let tierDetail
  try {
    tierDetail = await userDeployerWhitelist!.getTierInfoAsync(payload.tierID)
  } catch (error) {
    log("getTierInfoAsync error", error)
  }
  return tierDetail
}

/**
 *
 * @param context
 * @param payload
 */
export async function addDeployer(
  context: WhiteListContext,
  payload: { deployer: string; tier: ITier },
) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist!
  const deployAddress = new Address(
    context.rootState.plasma.client!.chainId,
    LocalAddress.fromHexString(payload.deployer),
  )
  feedbackModule.setTask(i18n.t("feedback_msg.task.adding_deployer").toString())
  try {
    const contractAddress = userDeployerWhitelist.address.local.toString()
    const approvedResult = await plasmaModule.approve({
      symbol: "LOOM",
      weiAmount: payload.tier.fee,
      to: contractAddress,
    })
    log("approved", approvedResult)
  } catch (error) {
    console.log("catch", error)
    feedbackModule.endTask()
    return
  }

  let result
  try {
    feedbackModule.setStep(i18n.t("feedback_msg.step.adding_new_deployer").toString())
    // TODO: update this if we have more tier: pass tier
    result = await userDeployerWhitelist.addDeployerAsync(deployAddress)
    log("addDeployerAsync result", result)
    await whiteListModule.getDeployers()
    feedbackModule.showSuccess(
      i18n.t("messages.add_deployer_addr_success_tx").toString(),
    )
  } catch (error) {
    log("addDeployerAsync error", error)
    let errorMessage = (error as Error).message
    if (errorMessage.includes("User denied message")) {
      errorMessage = i18n.t("messages.user_denied_sign_tx").toString()
    } else if (errorMessage.includes("deployer already exists")) {
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
export async function getDeployers(context: WhiteListContext) {
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
    log("getDeployersAsync error", error)
    deployerAddresses = []
  }
  const deployedContractAddress = {}
  deployerAddresses.forEach((address) => { deployedContractAddress[address.hex] = [] })
  whiteListModule.setUserDeployersAddress(deployerAddresses)
  whiteListModule.setDefaultDeployedContractAddress(deployedContractAddress)
}

/**
 *
 * @param context
 * @param payload
 */
export async function getDeployedContractAddresses(context: WhiteListContext, payload: {deployerAddress: Address}) {
  const contract = context.state.userDeployerWhitelist!
  let contractAddresses: IDeployedContract[] | [] = []

  try {
    contractAddresses = await contract.getDeployedContractsAsync(payload.deployerAddress)
    log("deployed contract addresses", contractAddresses)
    const Addresses = contractAddresses.map((addr) => addr.address.local.toString())
    whiteListModule.setDeployedContractAddress({
      deployerAddress: payload.deployerAddress.local.toString(),
      deployedContractAddress: Addresses,
    })
  } catch (error) {
    log("getDeployedContractsAsync error", error)
  }
  return contractAddresses
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
export async function generateSeeds(context: WhiteListContext) {
  feedbackModule.setTask(i18n.t("feedback_msg.task.new_key").toString())
  feedbackModule.setStep(i18n.t("feedback_msg.step.generating_new_key").toString())

  const mnemonic = generateMnemonic()
  const seed = mnemonicToSeedSync(mnemonic)
  const privateKeyUint8ArrayFromSeed = CryptoUtils.generatePrivateKeyFromSeed(new Uint8Array(sha256.array(seed)))
  const privateKeyB64 = CryptoUtils.Uint8ArrayToB64(privateKeyUint8ArrayFromSeed)
  const publicKey = await plasmaModule.getPublicAddrePriaKeyUint8Array({ privateKey: privateKeyUint8ArrayFromSeed })

  feedbackModule.endTask()

  context.state.seed.mnemonic = mnemonic
  context.state.seed.publicAddress = publicKey
}
