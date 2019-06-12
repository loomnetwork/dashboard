/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"
import { Provider } from "ethers/providers"
import {
  Address,
  LocalAddress,
  Client,
  IEthereumSigner,
  EthersSigner,
  CryptoUtils,
} from "loom-js"
import {
  IAddressMapping,
  AddressMapper,
} from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"
import { ethers, Contract } from "ethers"

import { GatewayState, HasGatewayState } from "./types"

import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import { ActionContext } from "./types"
import { ParamType } from "ethers/utils"
import { getRequired } from "@/utils"

const log = debug("dash.mapper")

export async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const chainId = client.chainId
  const caller = context.rootState.plasma.appId.address
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
  const client = getRequired(rootState.plasma.client, "plasma client")
  const signer = getRequired(rootState.ethereum.signer, "signer")
  const caller = rootState.plasma.appId.address
  const ethAddress = getRequired(state.mapping, "mapping").from
  // @ts-ignore, bignumber changed between version
  const ethSigner = new EthersSigner(signer)
  const plasmaId = generateNewId()
  console.log("caller", caller)
  const mapper = await AddressMapper.createAsync(
    client,
    Address.fromString([client.chainId, caller].join(":")),
  )

  try {
    await mapper.addIdentityMappingAsync(
      ethAddress,
      plasmaId.address,
      ethSigner,
    )
    console.error("addIdentityMappingAsync ok  ")

    state.mapping = await mapper.getMappingAsync(
      Address.fromString(`eth:${ethAddress}`),
    )
  } catch (e) {
    console.error(e)
    console.error(
      "could not get mapping after creating a new identity" +
        ethAddress +
        plasmaId.address,
    )
    // feedback.showError("mapper.errors.create", e.message,{ethereum:ethAddress, plasma:plasmaId.address})
  } finally {
  }
}

function generateNewId(chainId = "default") {
  const privateKey = CryptoUtils.generatePrivateKey()
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = new Address(chainId, LocalAddress.fromPublicKey(publicKey))
  return { address, privateKey, publicKey }
}
