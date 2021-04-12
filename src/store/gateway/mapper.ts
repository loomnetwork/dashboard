/**
 * @module dpos-dashboard.gateway
 */

import { getRequired } from "@/utils"
import debug from "debug"
import {
  Address,
  CryptoUtils,
  EthersSigner,
  LocalAddress,
} from "loom-js"
import { AddressMapper } from "loom-js/dist/contracts/address-mapper"
import { ActionContext } from "./types"
import { createDefaultClient, createDefaultEthSignClientAsync } from "loom-js/dist/helpers"
import { feedbackModule } from "@/feedback/store"
import * as Sentry from "@sentry/browser"

import axios from "axios"
import { i18n } from "@/i18n"

const log = debug("dash.mapper")

export async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const chainId = client.chainId
  const caller = context.rootState.plasma.appId.address
  feedbackModule.setStep(i18n.t("feedback_msg.step.check_account_mapping").toString())
  const mapper = await AddressMapper.createAsync(
    client,
    Address.fromString([chainId, caller].join(":")),
  )
  try {
    log("getMappingAsync", `eth:${address}`)
    const mapping = await mapper.getMappingAsync(
      Address.fromString(`eth:${address}`),
    )
    context.state.mapping = mapping
    log("got mapping", context.state.mapping)
  } catch (e) {
    // check if user mapping is from Relentless Marketplace
    if (e.message.includes("failed to map address")) {
      context.state.mapping = {
        from: Address.fromString(`eth:${address}`),
        to: new Address("", new LocalAddress(new Uint8Array())),
      }
    } else {
      console.error("Failed to load mapping, response was " + e.message)
      // todo feedback.showError("mapper.errors.load")
      context.state.mapping = {
        from: Address.fromString(`eth:${address}`),
        to: new Address("", new LocalAddress(new Uint8Array())),
      }
    }
  } finally {
    mapper.removeAllListeners()
  }
}

export async function createMapping(context: ActionContext, privateKey: string) {
  const { rootState, state } = context
  // create a temporary client for new napping
  // const client = getRequired(rootState.plasma.client, "plasma client")
  const signer = getRequired(rootState.ethereum.signer, "signer")
  const caller = rootState.plasma.appId.address
  const ethAddress = getRequired(state.mapping, "mapping").from
  // @ts-ignore, bignumber changed between version
  const ethSigner = new EthersSigner(signer)
  const plasmaId = privateKey === "" ?
    generateNewId(context.rootState.plasma.chainId) :
    idFromPrivateKey(privateKey, context.rootState.plasma.chainId)

  state.requireMapping = false
  console.log("caller", caller)

  const { address, client } = createDefaultClient(
    CryptoUtils.Uint8ArrayToB64(plasmaId.privateKey),
    rootState.plasma.endpoint,
    rootState.plasma.chainId,
  )
  feedbackModule.setStep(
    i18n.t("feedback_msg.step.create_new_mapping", { network: rootState.ethereum.genericNetworkName }
  ).toString())
  const mapper = await AddressMapper.createAsync(client, address)
  try {
    await mapper.addIdentityMappingAsync(
      ethAddress,
      plasmaId.address,
      ethSigner,
    )
    log("addIdentityMappingAsync ok  ")
    loadMapping(context, rootState.ethereum.address)
  } catch (e) {
    if (e.message.includes("identity mapping already exists")) {
      state.requireMapping = true
      feedbackModule.showError(i18n.t("feedback_msg.error.supplied_key_already_mapped").toString())
    } else {
      feedbackModule.showError(i18n.t("feedback_msg.error.unexpected_error_while_add_account").toString())

      console.error(e)
      console.error(
        "could not get mapping after creating a new identity" +
        ethAddress +
        plasmaId.address,
      )
      Sentry.withScope((scope) => {
        scope.setExtra("ethereum", ethAddress.toString())
        scope.setExtra("plasma", plasmaId.address.toString())
        Sentry.captureException(e)
      })
      // feedback.showError("mapper.errors.create", e.message,{ethereum:ethAddress, plasma:plasmaId.address})
    }

  } finally {
    client.disconnect()
  }
}

export function generateNewId(chainId = "default") {
  const privateKey = CryptoUtils.generatePrivateKey()
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = new Address(chainId, LocalAddress.fromPublicKey(publicKey))
  return { address, privateKey, publicKey }
}

export function idFromPrivateKey(pk: string, chainId = "default") {
  const privateKey = CryptoUtils.B64ToUint8Array(pk)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = new Address(chainId, LocalAddress.fromPublicKey(publicKey))
  return { address, privateKey, publicKey }
}

/**
 * Check if user already have mapping on relentless, return in valid_address
 * if valid_address = false, There is a possibility that users have logged in marketplace with wallet before.
 * otherwise, it's assume that user is newcomer so new mapping will be create
 */
export async function checkRelentlessUser(context: ActionContext, address: string) {
  if (context.state.checkMarketplaceURL === "") {
    context.state.requireMapping = true
    return
  }
  const checkURL = context.state.checkMarketplaceURL.replace("{address}", address)
  await axios.get(checkURL).then((response) => {
    context.state.maybeRelentlessUser = !response.data.valid_address
    if (!context.state.maybeRelentlessUser) {
      context.state.requireMapping = true
    }
    log("maybeRelentlessUser", context.state.maybeRelentlessUser)
  })
}
