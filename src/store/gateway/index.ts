/**
 * @module dpos-dashboard.gateway
 */

import debug from "debug"
import BN from "bn.js"

import { getStoreBuilder } from "vuex-typex"
import { Provider } from 'ethers/providers'
import { Address, LocalAddress, Client, IEthereumSigner, EthersSigner } from "loom-js"
import { IAddressMapping, AddressMapper } from "loom-js/dist/contracts/address-mapper"
import { ERC20Gateway_v2 } from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2"
import ERC20GatewayABI_v2 from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2.json"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"
import { ethers, Contract } from 'ethers'

import { GatewayState, HasGatewayState } from "./types"

import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import * as mutations from "./mutations"
import { ethereumModule } from '../ethereum';

declare type ActionContext = BareActionContext<GatewayState, HasGatewayState>

function initialState(): GatewayState {
  return {
    mapping: null, 
    loom: {
      pendingReceipt: null,
      pendingTransaction: null,
      unclaimedTokens: [],
      address: "",      
    },
    main: {
      pendingReceipt: null,
      pendingTransaction: null,
      unclaimedTokens: [],
      address: "",      
    },    
  }
}

const builder = getStoreBuilder<HasGatewayState>().module("gateway", initialState())
const stateGetter = builder.state()
const contracts: {
  loom: ERC20Gateway_v2 | null,
  main: ERC20Gateway_v2 | null,  
} = {
  loom: null,
  main: null,
}

export const gatewayModule = {

    get state() { return stateGetter() },

    // gateway
    ethereumDeposit: builder.dispatch(ethereumDeposit),
    plasmaDeposit: builder.dispatch(plasmaDeposit),
    plasmaWithdraw: builder.dispatch(plasmaWithdraw),
    ethereumWithdraw: builder.dispatch(ethereumWithdraw),
    checkPendingReceipt: builder.dispatch(checkPendingReceipt),

    // mapper
    loadMapping: builder.dispatch(loadMapping),
    createMapping: builder.dispatch(createMapping),
    setMapping: builder.commit(mutations.setMapping),
}

export const createContracts = (provider: Provider) => {
  contracts.loom = new ethers.Contract(gatewayModule.state.loom.address, ERC20GatewayABI_v2, provider) as ERC20Gateway_v2
  // @ts-ignore
  contracts.main = new ethers.Contract(gatewayModule.state.main.address, ERC20GatewayABI_v2, provider) as ERC20Gateway_v2
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function ethereumDeposit(context: ActionContext, funds: Funds) {

  const {state, rootState} = context
  const {symbol, tokenAmount} = funds
  const approvalAmount = ethereumModule.allowance({symbol, spender: context.state.main.address})
  const approvalInBN = new BN(approvalAmount.toString())
  const approvalPayload = {
    to: context.state.main.address,
    ...funds
  }
  if(tokenAmount.gt(approvalInBN)) {
    await ethereumModule.approve(approvalPayload)
  } else {
    await contracts.main!.functions.depositERC20(
      funds.tokenAmount.toString(),
      rootState.ethereum.erc20Addresses[symbol],
    )
  }
  
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function plasmaDeposit( context: ActionContext, funds: Funds) {

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

//
// mapper
//

export async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const chainId = client.chainId
  const caller = context.rootState.plasma.appKey.address
  const mapper = await AddressMapper.createAsync(client, Address.fromString([chainId, caller].join(":")))
  try {
    const mapping =  await mapper.getMappingAsync(Address.fromString(`eth:${address}`))
    console.log("mapping", context.state.mapping)
    context.state.mapping = mapping
    console.log("got mapping", context.state.mapping)
  } catch (e) {
    if (e.message.includes("failed to map address")) {
      context.state.mapping = {
        from: Address.fromString(`eth:${address}`),
        to: Address.fromString(":0x0000000000000000"),
      }
    } else {
      console.error("Failed to load mapping, response was " + e.message)
      // todo feedback.showError("mapper.errors.load")
    }
  }
}

function setMapping(state: GatewayState, mapping: IAddressMapping) {
  state.mapping = mapping
}

async function createMapping(context: ActionContext) {
  const {rootState, state} = context
  // create a temporary client for new napping
  const client = getRequired(rootState.plasma.client, "plasma client")
  const ethAddress = getRequired(state.mapping, "mapping").from
  const signer = getRequired(rootState.ethereum.signer, "signer")
  const caller = rootState.plasma.appKey.address
  // @ts-ignore, bignumber changed between version
  const ethSigner = new EthersSigner(signer)
  const plasmaId = generateNewId()
  const mapper = await AddressMapper.createAsync(client, Address.fromString([client.chainId, caller].join()))

  try {
    await mapper.addIdentityMappingAsync(Address.fromString(`eth:${ethAddress}`), plasmaId.address, ethSigner)
    state.mapping = await mapper.getMappingAsync(Address.fromString(`eth:${ethAddress}`))
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
