/**
 * @module dpos-dashboard.plasma
 */

import { getStoreBuilder } from "vuex-typex"

import { PlasmaState, PlasmaConfig } from "./types"
import BN from "bn.js"
import { PlasmaSigner, HasPlasmaState, PlasmaContext } from "./types"
import { Client, Address, LocalAddress, CryptoUtils } from "loom-js"

import { i18n } from "@/i18n"

import {
  setupProtocolsFromEndpoint,
  createDefaultTxMiddleware,
} from "loom-js"

// assets (make this a separate module)

import debug from "debug"

import * as Tokens from "./tokens"
import { feedbackModule } from "@/feedback/store"
import Axios from "axios"

const log = debug("dash.plasma")

// web3 instance to use to interact with plasma contracts

const initialState: PlasmaState = {
  networkId: "",
  chainId: "",
  endpoint: "",
  historyUrl: "",
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
    LOOM: {
      balance: new BN("0"),
      loading: false,
      decimals: 18,
    },
  },
  selectedToken: "",
  blockExplorer: "",
  loomGamesEndpoint: "",
  history: [],
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
  signerIsSet: builder.dispatch(signerIsSet),

  // Coins
  addToken: builder.dispatch(Tokens.addToken),
  refreshBalance: builder.dispatch(Tokens.refreshBalance),
  allowance: builder.dispatch(Tokens.allowance),
  approve: builder.dispatch(Tokens.approve),
  transfer: builder.dispatch(Tokens.transfer),

  refreshHistory: builder.dispatch(refreshHistory),

  addCoinState: builder.commit(Tokens.addCoinState),

  // Assets
  getPublicAddrePriaKeyUint8Array: builder.dispatch(
    getPublicAddressFromPrivateKeyUint8Array,
  ),
}

function setConfig(state: PlasmaState, config: PlasmaConfig) {
  log("config", config)
  Object.assign(state, config)
  if (state.client) {
    state.client.removeAllListeners().disconnect()
  }
  state.client = createClient({
    chainId: state.chainId,
    endpoint: state.endpoint,
  })
  state.client.txMiddleware = createDefaultTxMiddleware(
    state.client,
    CryptoUtils.B64ToUint8Array(state.appId.private),
  )
}

// getter
function getAddress(state: PlasmaState): Address {
  const chainId = state.chainId
  return new Address(chainId, LocalAddress.fromHexString(state.address))
}

function createClient(env: { chainId: string; endpoint: string }) {
  const { writer, reader } = setupProtocolsFromEndpoint(env.endpoint)
  return new Client(env.chainId, writer, reader)
}

/**
 * checks if signer is set, if not  show an alert to tell the user they should
 * connect their wallet first
 * @returns true if signer is set false otherwise
 */
function signerIsSet(contex: PlasmaContext) {
  if (contex.state.signer !== null) return true
  if (window.confirm("You need to connect your wallet first. Connect now?")) {
    window.location.assign("/")
  }
  return false
}

/**
 * On identity change set signer
 * configure client with signer middleware
 * reinitialise loom provider and web3 for contracts
 * @param ctx
 * @param id
 */
async function changeIdentity(
  ctx: PlasmaContext,
  id: { signer: PlasmaSigner | null; address: string },
) {
  const { signer, address } = id
  const client = ctx.state.client!
  ctx.state.address = address
  ctx.state.signer = signer

  // add the conresponding middleware
  if (signer === null) {
    // reset client middleware
    ctx.state.client!.txMiddleware = []
    ctx.state.client!.txMiddleware = createDefaultTxMiddleware(
      client,
      CryptoUtils.B64ToUint8Array(ctx.state.appId.private),
    )
    // destroy loomProvider and old web3
  } else {
    feedbackModule.setStep(i18n.t("feedback_msg.step.connecting_plasma").toString())
    await signer.configureClient(ctx.state.client!)
    feedbackModule.endTask()
  }

}

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

function getPublicAddressFromPrivateKeyUint8Array(
  context: PlasmaContext,
  payload: { privateKey: Uint8Array },
) {
  const publicKeyUint8Array = CryptoUtils.publicKeyFromPrivateKey(
    payload.privateKey,
  )
  const publicAddress = LocalAddress.fromPublicKey(
    publicKeyUint8Array,
  ).toString()
  return publicAddress
}

/**
 *
 * @param context
 */
async function refreshHistory(context: PlasmaContext) {
  // FIXME indexer is called with the signers address (eth:)
  // and does not return the sane data if called woth loom address
  // so this won't work if we have no signer and only use the account's loom address
  const address = await getCallerAddress(context)
  const indexerUrl = context.state.historyUrl.replace("{address}", address.toString())

  // `${dappChainEventUrl}/eth:${currentMetamaskAddress}?sort=-block_height`,

  try {
    const response = await Axios.get(indexerUrl)
    context.state.history = (response.data.txs || [])
      .filter((item) => ! /^event\:Mainnet/.test(item.topic))
      .map((item) => {
        return {
          type: item.topic,
          amount: new BN(item.token_amount || "0"),
          token: "LOOM",
          blockNumber: item.block_height,
        }
      })
  } catch (e) {
    console.error("Error loading plasma history. " + (e as Error).message)
  }

  // example entry
  // {
  //   "id": 5640,
  //   "created_at": "2019-05-08T04:17:08Z",
  //   "updated_at": "2019-05-08T04:17:30Z",
  //   "block_height": 4699351,
  //   "block_time": 1557289028,
  //   "tx_hash": "",
  //   "tx_index": 0,
  //   "token_owner": "eth:0xff7c1A7d2878d2cc6E7C2b7eF8Dcb615F620184a",
  //   "token_contract": "eth:0xA4E8C3eC456107ea67D3075bf9e3df3a75823Db0",
  //   "token_kind": 4,
  //   "token_amount_raw": "DeC2s6dkAAA=",
  //   "token_amount": "1000000000000000000",
  //   "signature": null,
  //   "status": 1,
  //   "topic": "event:MainnetWithdrawalEvent"
  // }
}
