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
import { Gateway } from "loom-js/dist/mainnet-contracts/Gateway"
import { ERC20Gateway_v2 } from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2"
import GatewayABI from "loom-js/dist/mainnet-contracts/Gateway.json"
import ERC20GatewayABI_v2 from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2.json"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"
import { ethers, Contract } from "ethers"

import { GatewayState, HasGatewayState } from "./types"

import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import * as mutations from "./mutations"
import { ethereumModule } from "../ethereum"
import { ParamType } from "ethers/utils"

const log = debug("dash.eth-gateway")

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

const builder = getStoreBuilder<HasGatewayState>().module(
  "gateway",
  initialState(),
)
const stateGetter = builder.state()
const contracts: {
  loom: ERC20Gateway_v2 | null;
  main: Gateway | null;
} = {
  loom: null,
  main: null,
}

export const gatewayModule = {
  get state() {
    return stateGetter()
  },

  // gateway
  ethereumDeposit: builder.dispatch(ethereumDeposit),
  plasmaWithdraw: builder.dispatch(plasmaWithdraw),
  ethereumWithdraw: builder.dispatch(ethereumWithdraw),
  checkPendingReceipt: builder.dispatch(checkPendingReceipt),

  // mapper
  loadMapping: builder.dispatch(loadMapping),
  createMapping: builder.dispatch(createMapping),
  setMapping: builder.commit(mutations.setMapping),
}

/**
 *
 * @param provider ethers provider
 */
export function createContracts(provider: Provider) {
  contracts.loom = new ethers.Contract(
    gatewayModule.state.loom.address,
    ERC20GatewayABI_v2,
    provider,
  ) as ERC20Gateway_v2
  // @ts-ignore
  contracts.main = new ethers.Contract(
    gatewayModule.state.main.address,
    GatewayABI as ParamType[],
    provider,
  ) as Gateway
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function ethereumDeposit(context: ActionContext, funds: Funds) {
  const { state, rootState } = context
  const { symbol, weiAmount } = funds
  const approvalAmount = await ethereumModule.allowance({
    symbol,
    spender: state.main.address,
  })
  const approvalPayload = {
    to: context.state.main.address,
    ...funds,
  }
  if (weiAmount.gt(approvalAmount)) {
    await ethereumModule.approve(approvalPayload)
  }

  await contracts.main!.functions.depositERC20(
      funds.weiAmount.toString(),
      rootState.ethereum.erc20Addresses[symbol],
  )
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function plasmaWithdraw(context: ActionContext, funds: Funds) {
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
  // checks in both erc20gw and gw
  return timer(2000).toPromise()
}

//
// mapper
//

export async function loadMapping(context: ActionContext, address: string) {
  const client = context.rootState.plasma.client!
  const chainId = client.chainId
  const caller = context.rootState.plasma.appKey.address
  const mapper = await AddressMapper.createAsync(
    client,
    Address.fromString([chainId, caller].join(":")),
  )
  try {
    const mapping = await mapper.getMappingAsync(
      Address.fromString(`eth:${address}`),
    )
    context.state.mapping = mapping
    log("got mapping", context.state.mapping)
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

async function createMapping(context: ActionContext) {
  const { rootState, state } = context
  // create a temporary client for new napping
  const client = getRequired(rootState.plasma.client, "plasma client")
  const signer = getRequired(rootState.ethereum.signer, "signer")
  const caller = rootState.plasma.appKey.address
  const ethAddress = getRequired(state.mapping, "mapping").from
  // @ts-ignore, bignumber changed between version
  const ethSigner = new EthersSigner(signer)
  const plasmaId = generateNewId()
  const mapper = await AddressMapper.createAsync(
    client,
    Address.fromString([client.chainId, caller].join()),
  )

  try {
    await mapper.addIdentityMappingAsync(
      Address.fromString(`eth:${ethAddress}`),
      plasmaId.address,
      ethSigner,
    )
    state.mapping = await mapper.getMappingAsync(
      Address.fromString(`eth:${ethAddress}`),
    )
  } catch (e) {
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
  const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = new Address(chainId, LocalAddress.fromPublicKey(publicKey))
  return { address, privateKey, publicKey }
}

function getRequired<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new Error("Value required but was null " + name)
  }
  return value
}
