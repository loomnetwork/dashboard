/**
 * @module dpos-dashboard.plasma
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import {
  PlasmaState,
  TransferRequest,
  PlasmaSigner,
  CardDetail,
  PackDetail,
  HasPlasmaState,
  PlasmaContext,
} from "./types"
import { Client, Address, LocalAddress } from "loom-js"
import BN from "bn.js"
import { TokenSymbol } from "../ethereum/types"

import { DashboardState } from "@/types"
import { getCardByTokenId } from "@/utils"
import { PACKS_NAME } from "./assets/reactions"
import { CommonTypedStore } from "../common"
import { DPOSTypedStore } from "../dpos-old"
import configs from "@/envs"
import { setupProtocolsFromEndpoint } from "loom-js/dist/helpers"

// assets (make this a sepoerate module)
import * as getters from "./assets/getters"
import * as assetMutations from "./assets/mutations"
// plasma
import * as mutations from "../plasma/mutations"

import debug from "debug"

import Web3 from "web3"
import { Coin, EthCoin } from "loom-js/dist/contracts"

import * as Tokens from "./contracts/tokens"

const log = debug("plasma")

// web3 instance to use to interact with plasma contracts

const initialState: PlasmaState = {
  networkId: "us1",
  chainId: "default",
  // todo move these out of the state
  client: createClient(configs.us1),
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
  // these should go in a seperate module
  packsContract: {},
  cardContract: null,
  cardBalance: [],
  packBalance: [],
  cardToTransferSelected: null,
  packToTransferSelected: null,
  allCardsToTransferSelected: {
    edition: "none",
    cards: [],
    amount: 0,
  },
  tokenSelected: "",
  tokensSymbol: ["loom", "eth"],
}

const builder = getStoreBuilder<HasPlasmaState>().module("plasma", initialState)
const stateGetter = builder.state()

export const plasmaModule = {
  get state() {
    return stateGetter()
  },

  getAddress: builder.read(getAddress),
  changeIdentity: builder.dispatch(changeIdentity),
  getCallerAddress: builder.dispatch(getCallerAddress),

  // Coins
  refreshBalance: builder.dispatch(Tokens.refreshBalance),
  allowance: builder.dispatch(Tokens.allowance),
  approve: builder.dispatch(Tokens.approve),
  transfer: builder.dispatch(Tokens.transfer),
  // addTokens: builder.dispatch(Tokens.addContract),

  // Assets

  // // Getters
  getCardInstance: builder.read(getters.getCardInstance),
  // AssetMutations
  setPacksContract: builder.commit(assetMutations.setPacksContract),
  setCardContract: builder.commit(assetMutations.setCardContract),
  setCardBalance: builder.commit(assetMutations.setCardBalance),
  setPackBalance: builder.commit(assetMutations.setPackBalance),
  setCardToTransferSelected: builder.commit(
    assetMutations.setCardToTransferSelected,
  ),
  setAllCardsToTransferSelected: builder.commit(
    assetMutations.setAllCardsToTransferSelected,
  ),
  setPackToTransferSelected: builder.commit(assetMutations.setPackToTransferSelected),

  
  // Actions
  checkCardBalance: builder.dispatch(checkCardBalance),
  checkPackBalance: builder.dispatch(checkPackBalance),
  transferPacks: builder.dispatch(transferPacks),
  transferCards: builder.dispatch(transferCards),
  //Mutations
  setTokenSelected: builder.commit(mutations.setTokenSelected),

}

async function checkCardBalance(context: PlasmaContext) {
  const account = context.state.address
  const caller = await plasmaModule.getCallerAddress()

  const tokens = await context.state
    .cardContract!.methods.tokensOwned(account)
    // @ts-ignore
    .call({ from: caller.local.toString() })
  const cards: CardDetail[] = []
  tokens.indexes.forEach((id: string, i: number) => {
    const card = getCardByTokenId(id)
    card.amount = parseInt(tokens.balances[i], 10)
    cards.push(card)
  })
  plasmaModule.setCardBalance(cards)
}

async function checkPackBalance(context: PlasmaContext) {
  const account = context.state.address
  const caller = await plasmaModule.getCallerAddress()
  const packs: PackDetail[] = []

  PACKS_NAME.forEach(async (type) => {
    const amount = await context.state.packsContract[type].methods
      .balanceOf(account)
      .call({ from: caller.local.toString() })
    packs.push({ type, amount })
  })
  plasmaModule.setPackBalance(packs)
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
    ctx.state.client.txMiddleware = []
    // destroy loomProvider and old web3
  } else {
    await signer.configureClient(ctx.state.client)
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
  let chainId: string = state.client.chainId
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

async function transferPacks(
  context: PlasmaContext,
  payload: {
    packType: string
    amount: number
    receiver: string,
  },
) {
  try {
    // DPOSTypedStore.setShowLoadingSpinner(true)
    const ethAddress = await getCallerAddress(context)
    const result = await context.state.packsContract[payload.packType].methods
      .transfer(payload.receiver, payload.amount)
      .send({ from: ethAddress })
    console.log("transfer packs result", result)
    return result
  } catch (error) {
    // DPOSTypedStore.setShowLoadingSpinner(false)
    throw error
  }
}

async function transferCards(
  context: PlasmaContext,
  payload: {
    cardIds: string[]
    amounts: number[]
    receiver: string,
  },
) {
  console.log("payload", payload)
  try {
    // caller address is either eth if eth signer is there or plasma address i
    const caller = await getCallerAddress(context)
    const plasmaAddress = context.state.address
    const result = await context.state
      .cardContract!.methods.batchTransferFrom(
        plasmaAddress,
        payload.receiver,
        payload.cardIds,
        payload.amounts,
      )
      // @ts-ignore
      .send({ from: caller })
    console.log("transfer cards result", result)
    // TODO: this is not working
    CommonTypedStore.setSuccessMsg("Transferring cards success.")
    await plasmaModule.checkCardBalance()
    return result
  } catch (error) {
    // TODO: this is not working
    CommonTypedStore.setErrorMsg(`Error Transferring cards: ${error.message}`)
    throw error
  }
}

function getErc20Contract(symbol: string): ERC20 {
  // @ts-ignore
  return null
}
