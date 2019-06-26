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
  createDefaultTxMiddleware,
} from "loom-js"
import { AddressMapper } from "loom-js/dist/contracts/address-mapper"
import { ActionContext } from "./types"
import { createDefaultClient } from "loom-js/dist/helpers"
import { feedbackModule } from "@/feedback/store"

import axios from "axios"
import { state } from '../common';
import { setFromMarketplace, setNewMappingAgree } from './mutations';

const log = debug("dash.mapper")

export async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const chainId = client.chainId
  const caller = context.rootState.plasma.appId.address
  feedbackModule.setStep("Checking account mapping")
  const mapper = await AddressMapper.createAsync(
    client,
    Address.fromString([chainId, caller].join(":")),
  )
  // check if user mapping is from Relentless Marketplace
  isUserFromMarketplace(context, address)
  try {
    log("getMappingAsync", `eth:${address}`)
    const mapping = await mapper.getMappingAsync(
      Address.fromString(`eth:${address}`),
    )
    context.state.mapping = mapping
    log("got mapping", context.state.mapping)
  } catch (e) {
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

export async function createMapping(context: ActionContext) {
  const { rootState, state } = context
  // create a temporary client for new napping
  // const client = getRequired(rootState.plasma.client, "plasma client")
  const signer = getRequired(rootState.ethereum.signer, "signer")
  const caller = rootState.plasma.appId.address
  const ethAddress = getRequired(state.mapping, "mapping").from
  // @ts-ignore, bignumber changed between version
  const ethSigner = new EthersSigner(signer)
  const plasmaId = generateNewId(context.rootState.plasma.chainId)
  console.log("caller", caller)

  const { address, client } = createDefaultClient(
    CryptoUtils.Uint8ArrayToB64(plasmaId.privateKey),
    rootState.plasma.endpoint,
    rootState.plasma.chainId,
  )
  const mapper = await AddressMapper.createAsync(client, address)
  try {
    await mapper.addIdentityMappingAsync(
      ethAddress,
      plasmaId.address,
      ethSigner,
    )
    console.error("addIdentityMappingAsync ok  ")
    loadMapping(context, rootState.ethereum.address)
  } catch (e) {
    console.error(e)
    console.error(
      "could not get mapping after creating a new identity" +
      ethAddress +
      plasmaId.address,
    )
    // feedback.showError("mapper.errors.create", e.message,{ethereum:ethAddress, plasma:plasmaId.address})
  } finally {
    client.disconnect()
  }
}

function generateNewId(chainId = "default") {
  const privateKey = CryptoUtils.generatePrivateKey()
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = new Address(chainId, LocalAddress.fromPublicKey(publicKey))
  return { address, privateKey, publicKey }
}

async function isUserFromMarketplace(context: ActionContext, address: string) {
  /* Check if user already have mapping, return in valid_address
    if valid_address = false, There is a possibility that users have logged in marketplace with wallet before.
    otherwise, it's assume that user is newcomer so new mapping will be create
  */

  // https://dev-auth.loom.games always return 'valid_address' as true no matter what address is
  // So url will be change later
  const checkURL = `https://stage-auth.loom.games/wallet/address?address=${address}&wallet=eth`
  await axios.get(checkURL).then((response) => {
    console.log("RESPONSE Valid_address = ", response.data.valid_address)
    setFromMarketplace(context.state, !response.data.valid_address)
    setTimeout(() => {
      setNewMappingAgree(context.state, response.data.valid_address)
    }, 2000)
  })
}
