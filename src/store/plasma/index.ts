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
} from "./types"
import {
  Client,
  Address,
  LocalAddress,
} from "loom-js"
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

const log = debug("plasma")

// web3 instance to use to interact with plasma contracts

const initialState: PlasmaState = {
  networkId: "us1",
  chainId: "default",
  // not state but...
  client: createClient(configs.us1),
  web3: null,
  provider: null,
  signer: null,
  address: "",
  appKey: {
    private:
      "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
    public: "",
    address: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
  },
  erc20Addresses: {
    [TokenSymbol.LOOM]: "",
    [TokenSymbol.ETH]: "",
    [TokenSymbol.BNB]: "",
  },
  coins: {
    loom: {
      contract: null,
      balance: new BN("0"),
      loading: false,
    },
    eth: {
      contract: null,
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
}

const builder = getStoreBuilder<DashboardState>().module(
  "plasma",
  initialState,
)
const stateGetter = builder.state()
declare type ActionContext = BareActionContext<PlasmaState, DashboardState>

export const plasmaModule = {
  get state() {
    return stateGetter()
  },

  getAddress: builder.read(getAddress),
  changeIdentity: builder.dispatch(changeIdentity),
  getCallerAddress: builder.dispatch(getCallerAddress),

  // Coins
  refreshBalance: builder.dispatch(refreshBalance),
  approve: builder.dispatch(approveTransfer),
  transfer: builder.dispatch(transferTokens),

  // Assets

  // Getters
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

async function checkCardBalance(context: ActionContext) {
  const dposUser = await context.rootState.DPOS.dposUser
  const account = dposUser!.loomAddress.local.toString()
  const ethAddr = dposUser!.ethAddress
  const tokens = await context.state
    .cardContract!.methods.tokensOwned(account)
    .call({ from: ethAddr })
  const cards: CardDetail[] = []
  tokens.indexes.forEach((id: string, i: number) => {
    const card = getCardByTokenId(id)
    card.amount = parseInt(tokens.balances[i], 10)
    cards.push(card)
  })
  plasmaModule.setCardBalance(cards)
}

async function checkPackBalance(context: ActionContext) {
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
  ctx: ActionContext,
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
async function getCallerAddress(ctx: ActionContext) {
  const state = ctx.state
  let caller: string
  let chainId: string = state.client.chainId
  if (state.signer) {
    caller = await state.signer.getAddress()
    chainId = state.signer.chain
  } else if (state.address) {
    caller = state.address
  } else {
    caller = state.appKey.address
    // todo get plasma chain id from current config
    // as the client might be initialized witg a foreign chain id (or is it?)
  }
  return Address.fromString(`${chainId}:${caller}`)
}

async function transferPacks(
  context: ActionContext,
  payload: {
    packType: string;
    amount: number;
    destinationDappchainAddress: string;
  },
) {
  try {
    DPOSTypedStore.setShowLoadingSpinner(true)
    const ethAddress = await plasmaModule.getCallerAddress()
    const result = await context.state.packsContract[payload.packType].methods
      .transfer(payload.destinationDappchainAddress, payload.amount)
      .send({ from: ethAddress })
    console.log("transfer packs result", result)
    // TODO: this is not working
    CommonTypedStore.setSuccessMsg("Transferring packs success.")
    await plasmaModule.checkPackBalance()
    DPOSTypedStore.setShowLoadingSpinner(false)
    return result
  } catch (error) {
    DPOSTypedStore.setShowLoadingSpinner(false)
    // TODO: this is not working
    CommonTypedStore.setErrorMsg(`Error Transferring packs: ${error.message}`)
    throw error
  }
}

async function transferCards(
  context: ActionContext,
  payload: {
    cardIds: string[];
    amounts: number[];
    destinationDappchainAddress: string;
  },
) {
  console.log("payload", payload)
  try {
    const dposUser = await context.rootState.DPOS.dposUser
    const dappchainAddress = dposUser!.loomAddress.local.toString()
    const ethAddress = dposUser!.ethAddress
    const result = await context.state
      .cardContract!.methods.batchTransferFrom(
        dappchainAddress,
        payload.destinationDappchainAddress,
        payload.cardIds,
        payload.amounts,
      )
      .send({ from: ethAddress })
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

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function refreshBalance(context: ActionContext, token: string) {
  const coins = context.state.coins
  const addr = new Address(
    "default",
    LocalAddress.fromHexString(context.state.address),
  )
  coins[token].loading = true
  switch (token) {
    case "loom":
      coins.loom.balance = await coins.loom.contract!.getBalanceOfAsync(addr)
      log("updateBalance", token, coins.loom.balance)
      break
    case "eth":
      coins.eth.balance = await coins.eth.contract!.getBalanceOfAsync(addr)
      log("updateBalance", token, coins.eth.balance)
      break
    default:
      // const contract = getErc20Contract(token)
      // balance = await state.erc20[symbol].functions.balanceOf(addr)
      coins[token].balance = new BN("0")
  }
  coins[token].loading = false
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approveTransfer(
  context: ActionContext,
  { symbol, tokenAmount, to }: TransferRequest,
) {
  const balance = context.state.coins[symbol].balance
  const weiAmount = tokenAmount
  if (weiAmount.gt(balance)) {
    throw new Error("approval.balance.low")
  }

  const contract: ERC20 = getErc20Contract(symbol)

  return contract.functions.approve(to, weiAmount.toString())
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
async function transferTokens(
  context: ActionContext,
  funds: {
    symbol: string;
    tokenAmount: BN;
    to: string;
  },
) {
  const {coins, chainId} = context.state
  const {
    symbol,
    tokenAmount,
    to,
  } = funds
  const contract = coins[symbol].contract!

  const addrObject = Address.fromString(`${chainId}:${to}`)
  switch (funds.symbol) {
    case "loom":
      await ( contract as Coin).transferAsync(addrObject, tokenAmount)
      break
    case "eth":
      await ( contract as EthCoin).transferAsync(addrObject, tokenAmount)
      break
    default:
      // const contract = getErc20Contract(token)
      await (contract as ERC20).functions.transfer(funds.to, funds.tokenAmount.toString())
  }
}
