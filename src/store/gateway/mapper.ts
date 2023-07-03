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
import { createDefaultClient } from "loom-js"
import { feedbackModule } from "@/feedback/store"
import * as Sentry from "@sentry/browser"

import { i18n } from "@/i18n"

const log = debug("dash.mapper")

export async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const chainId = client.chainId
  const caller = context.rootState.plasma.appId.address

  if (context.rootState.ethereum.wallet === null) {
    throw new Error("Expected rootState.ethereum.wallet to be set but was null")
  }
  const foreignNetwork = String(context.rootState.ethereum.wallet.chainId)
  const expectedNetwork = context.rootState.ethereum.networkId

  if (foreignNetwork !== expectedNetwork) {
    console.warn(`Expected network ${expectedNetwork} but wallet network is ${foreignNetwork}.`)
    // fail silently. UI will pickup the state and let user know
    return
  }

  feedbackModule.setStep(i18n.t("feedback_msg.step.check_account_mapping").toString())
  const mapper = await AddressMapper.createAsync(
    client,
    Address.fromString([chainId, caller].join(":")),
  )
  try {
    const hasMapping = await mapper.hasMappingAsync(
      Address.fromString(`eth:${address}`),
    )
    if (hasMapping) {
      log("getMappingAsync", `eth:${address}`)
      const mapping = await mapper.getMappingAsync(
        Address.fromString(`eth:${address}`),
      )
      context.state.mapping = mapping
      log("got mapping", context.state.mapping)
    } else {
      // set an empty/placeholder mapping until the real one gets created
      context.state.mapping = {
        from: Address.fromString(`eth:${address}`),
        to: new Address("", new LocalAddress(new Uint8Array())),
      }
      // trigger display of AccountMappingModal
      context.state.requireMapping = true
    }
  } catch (e) {
    console.error("Failed to load mapping", e)
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
  log("caller", caller)

  const { address, client } = createDefaultClient(
    CryptoUtils.Uint8ArrayToB64(plasmaId.privateKey),
    rootState.plasma.endpoint,
    rootState.plasma.chainId,
  )
  feedbackModule.setStep(
    i18n.t("feedback_msg.step.create_new_mapping", { network: rootState.ethereum.genericNetworkName },
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
    if ((e as Error).message.includes("identity mapping already exists")) {
      state.requireMapping = true
      feedbackModule.showError(i18n.t("feedback_msg.error.supplied_key_already_mapped").toString())
    } else {
      feedbackModule.showError(i18n.t("feedback_msg.error.unexpected_error_while_add_account").toString())

      console.error(e)
      console.error(`Could not get mapping after creating a new identity ${ethAddress} ${plasmaId.address}`)
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
