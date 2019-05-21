/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"

import { Address, LocalAddress, Client, IEthereumSigner, EthersSigner } from "loom-js"
import { IAddressMapping, AddressMapper } from "loom-js/dist/contracts/address-mapper"

import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"

import { GatewayState, HasGatewayState } from "./types"

import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import * as mutations from "./mutations"

declare type ActionContext = BareActionContext<GatewayState, HasGatewayState>

function initialState(): GatewayState {
  return {
    mapping: null,
    pendingReceipt: null,
    pendingTransaction: null,
    unclaimedTokens: [],
}
}

const builder = getStoreBuilder<HasGatewayState>().module("ethGateway", initialState())
const stateGetter = builder.state()

export const gatewayModule = {

    get state() { return stateGetter() },

    deposit: builder.dispatch(deposit),
    plasmaWithdraw: builder.dispatch(plasmaWithdraw),
    ethereumWithdraw: builder.dispatch(ethereumWithdraw),
    checkPendingReceipt: builder.dispatch(checkPendingReceipt),

    checkMapping: builder.dispatch(loadMapping),
    createMapping: builder.dispatch(createMapping),

}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function deposit( context: ActionContext, funds: Funds) {
  return timer(2000).toPromise()
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function plasmaWithdraw( context: ActionContext, funds: Funds ) {
  return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function ethereumWithdraw(context: ActionContext, funds: Funds) {
  return timer(2000).toPromise()
}

export function checkPendingReceipt(context: ActionContext) {
  return timer(2000).toPromise()
}

async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const caller = context.rootState.plasma.genericAddress
  const mapper = await AddressMapper.createAsync(client, caller)
  try {
    context.state.mapping = await mapper.getMappingAsync(Address.fromString(`eth:${address}`))
  } catch (e) {
    if (e.message.includes("failed to map address")) {
      context.state.mapping = {from: Address.fromString(`eth:${address}`), to: Address.fromString(":0x0000000000000000")}
    } else {
      console.error("Failed to load mapping, response was " + e.message)
      // feedback.showError("mapper.errors.load")
    }
  }
}

async function createMapping(context: ActionContext) {
  // create a temporary client for new napping
  const client = getRequired(context.rootState.plasma.client, "plasma client")
  const ethAddress = getRequired(context.state.mapping, "mapping").from
  const signer = getRequired(context.rootState.ethereum.signer, "signer")
  const caller = context.rootState.plasma.genericAddress
  // @ts-ignore, bignumber changed between version
  const ethSigner = new EthersSigner(signer)
  const plasmaId = generateNewId()
  const mapper = await AddressMapper.createAsync(client, caller)

  try {
    await mapper.addIdentityMappingAsync(Address.fromString(`eth:${ethAddress}`), plasmaId.address, ethSigner)
    context.state.mapping = await mapper.getMappingAsync(Address.fromString(`eth:${ethAddress}`))
  } catch (e) {
    console.error("could not get mapping after creating a new identity" + ethAddress + plasmaId.address)
    // feedback.showError("mapper.errors.create", e.message,{ethereum:ethAddress, plasma:plasmaId.address})
  }
}

function generateNewId() {
  return {address: Address.fromString("")}
}

function getRequired<T>(value: T|null, name: string): T {
  if (value === null) {
    throw new Error("Value required but was null " + name)
  }
  return value
}
