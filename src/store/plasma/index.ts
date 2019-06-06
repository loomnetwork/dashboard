/**
 * @module dpos-dashboard.plasma
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"

import {
  PlasmaState,
  CardDetail,
  PackDetail,
  TierID,
  PlasmaConfig,
} from "./types"
import BN from "bn.js"
import * as mutations from "./mutations"
import { noop } from "vue-class-component/lib/util"
import { getCardByTokenId, formatFromLoomAddress } from "@/utils"
import { DPOSTypedStore } from "../dpos-old"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { PlasmaSigner, HasPlasmaState, PlasmaContext } from "./types"
import { Client, Address, LocalAddress, CryptoUtils } from "loom-js"

import { DashboardState, Environment } from "@/types"

import { CommonTypedStore } from "../common"
import networks from "@/../chain-config"
import { setupProtocolsFromEndpoint } from "loom-js/dist/helpers"

import { UserDeployerWhitelist } from "loom-js/dist/contracts"

// assets (make this a sepoerate module)

import debug from "debug"

import * as Tokens from "./tokens"

const log = debug("dash.plasma")

// web3 instance to use to interact with plasma contracts

const initialState: PlasmaState = {
  networkId: "",
  chainId: "",
  endpoint: "",
  // todo move these out of the state
  client: null, // createClient(configs.us1),
  web3: null,
  provider: null,
  ethersProvider: null,
  signer: null,
  address: "",
  appId: {
    private:
      "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
    public: "",
    address: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
  },
  coins: {
    loom: {
      balance: new BN("0"),
      loading: false,
    },
    eth: {
      balance: new BN("0"),
      loading: false,
    },
  },
}
const builder = getStoreBuilder<HasPlasmaState>().module("plasma", initialState)
const stateGetter = builder.state()

export const plasmaModule = {
  get state() {
    return stateGetter()
  },

  setConfig: builder.commit(setConfig),

  getAddress: builder.read(getAddress),

  changeIdentity: builder.dispatch(changeIdentity),
  getCallerAddress: builder.dispatch(getCallerAddress),

  // Coins
  addToken: builder.dispatch(Tokens.addToken),
  refreshBalance: builder.dispatch(Tokens.refreshBalance),
  allowance: builder.dispatch(Tokens.allowance),
  approve: builder.dispatch(Tokens.approve),
  transfer: builder.dispatch(Tokens.transfer),
  // addTokens: builder.dispatch(Tokens.addContract),

  getPublicAddrePriaKeyUint8Array: builder.dispatch(
    getPublicAddressFromPrivateKeyUint8Array,
  ),
}

function setConfig(state: PlasmaState, config: PlasmaConfig) {
  log("config", config)
  Object.assign(state, config)
  state.client = createClient({
    chainId: state.chainId,
    endpoint: state.endpoint,
  })
}

// getter
function getAddress(state: PlasmaState): Address {
  const chainId = "default" // state.chainId
  return new Address(chainId, LocalAddress.fromHexString(state.address))
}

function createClient(env: { chainId: string; endpoint: string }) {
  const { writer, reader } = setupProtocolsFromEndpoint(env.endpoint)
  return new Client(env.chainId, writer, reader)
}

/**
 * on identify change set signer, configure client with signer middleware
 * reinitialise loom provider and web3 for contracts
 * @param ctx
 * @param id
 */
async function changeIdentity(
  ctx: PlasmaContext,
  id: { signer: PlasmaSigner | null; address: string },
) {
  const { signer, address } = id
  ctx.state.address = address
  ctx.state.signer = signer
  // add the conresponding middleware
  if (signer === null) {
    // reset client middleware
    ctx.state.client!.txMiddleware = []
    // destroy loomProvider and old web3
  } else {
    await signer.configureClient(ctx.state.client!)
  }
}

// getter but async so I guess it's an action according to vuex
/**
 * - if we have a signer use it's address (connected wallet case)
 * - if just address, use that (explorer case, readonly)
 * - otherwise use the generic address (readonly)
 * @param ctx
 */
async function getCallerAddress(ctx: PlasmaContext): Promise<Address> {
  const state = ctx.state
  let caller: string
  let chainId: string = state.client!.chainId
  if (state.signer) {
    caller = await state.signer.getAddress()
    chainId = state.signer.chain
  } else if (state.address) {
    caller = state.address
  } else {
    caller = state.appId.address
  }
  return Address.fromString(`${chainId}:${caller}`)
}

async function getPublicAddressFromPrivateKeyUint8Array(
  context: PlasmaContext,
  payload: { privateKey: Uint8Array },
) {
  const publicKeyUint8Array = await CryptoUtils.publicKeyFromPrivateKey(
    payload.privateKey,
  )
  const publicAddress = LocalAddress.fromPublicKey(
    publicKeyUint8Array,
  ).toString()
  return publicAddress
}
