/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"
import { PlasmaState, CardDetail, PackDetail } from "./types"
import * as getters from "./getters"
import * as mutations from "./mutations"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import { PlasmaState, HasPlasmaState, TransferRequest, PlasmaSigner } from "./types"
import { Client, Address } from "loom-js"
import BN from "bn.js"
import { createDefaultClient, setupProtocolsFromEndpoint } from "loom-js/dist/helpers"
import { TokenSymbol } from "../ethereum/types"
import { noop } from "vue-class-component/lib/util"
import { DashboardState } from '@/types';
import { getCardByTokenId } from "@/utils"
import { PACKS_NAME } from '../plasmaPlugin';
import { CommonTypedStore } from '../common';
import { DPOSTypedStore } from '../dpos-old';

import configs from "@/envs"

const initialState: PlasmaState = {
    // not state but...
    client: createClient(configs.us1),
    signer: null,
    address: "",
    appKey: {
        private: "",
        public: "",
        address: "",
    },
    balances: {
        [TokenSymbol.LOOM]: new BN("0"),
        [TokenSymbol.ETH]: new BN("0"),
        [TokenSymbol.BNB]: new BN("0"),
    },
    packsContract: {},
    cardContract: null,
    cardBalance: [],
    packBalance: [],
    cardToTransferSelected: {},
    packToTransferSelected: {},
    allCardsToTransferSelected: {
      edition: "none",
      cards: [],
      amount: 0,
    },
}

const builder = getStoreBuilder<DashboardState>().module("plasma", initialState)
const stateGetter = builder.state()
declare type ActionContext = BareActionContext<PlasmaState, DashboardState>

export const plasmaModule = {

    get state() { return stateGetter() },
      
    // Getters
    getCardInstance: builder.read(getters.getCardInstance),

    // actions
    checkCardBalance: builder.dispatch(checkCardBalance),
    checkPackBalance: builder.dispatch(checkPackBalance),
    transferPacks: builder.dispatch(transferPacks),
    transferCards: builder.dispatch(transferCards),
    changeIdentity: builder.dispatch(changeIdentity),
    updateBalance: builder.dispatch(updateBalance),
    approve: builder.dispatch(approveTransfer),
    transfer: builder.dispatch(transferTokens),
      
    // mutation
    setPacksContract: builder.commit(mutations.setPacksContract),
    setCardContract:  builder.commit(mutations.setCardContract),
    setCardBalance: builder.commit(mutations.setCardBalance),
    setPackBalance: builder.commit(mutations.setPackBalance),
    setCardToTransferSelected: builder.commit(mutations.setCardToTransferSelected),
    setAllCardsToTransferSelected: builder.commit(mutations.setAllCardsToTransferSelected),
    setPackToTransferSelected: builder.commit(mutations.setPackToTransferSelected),
  }

async function checkCardBalance(context: ActionContext) {
    const dposUser = await context.rootState.DPOS.dposUser
    const account = dposUser!.loomAddress.local.toString()
    const ethAddr = dposUser!.ethAddress
    const tokens = await context.state.cardContract!.methods
                .tokensOwned(account)
                .call({ from: ethAddr })
    let cards: CardDetail[] = []
    tokens.indexes.forEach((id: string, i: number) => {
      let card = getCardByTokenId(id)
      card.amount = parseInt(tokens.balances[i], 10)
      cards.push(card)
    })
    plasmaModule.setCardBalance(cards)

}

async function checkPackBalance(context: ActionContext) {
  const dposUser = await context.rootState.DPOS.dposUser
  const account = dposUser!.loomAddress.local.toString()
  const ethAddr = dposUser!.ethAddress
  let packs: PackDetail[] = []
  PACKS_NAME.forEach(async type => {
    const amount = await context.state.packsContract[type].methods
            .balanceOf(account)
            .call({ from: ethAddr })
    let pack =  {type, amount}
    packs.push(pack)
  })
  plasmaModule.setPackBalance(packs)
}

async function transferPacks(
  context: ActionContext,
  payload: {
    packType: string,
    amount: number,
    destinationDappchainAddress: string}) {
  try {
    DPOSTypedStore.setShowLoadingSpinner(true)
    const dposUser = await context.rootState.DPOS.dposUser
    const ethAddress = dposUser!.ethAddress
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
    cardIds: string[],
    amounts: number[],
    destinationDappchainAddress: string}) {
  console.log("payload", payload)
  try {
    DPOSTypedStore.setShowLoadingSpinner(true)
    const dposUser = await context.rootState.DPOS.dposUser
    const dappchainAddress = dposUser!.loomAddress.local.toString()
    const ethAddress = dposUser!.ethAddress
    const result = await context.state.cardContract!.methods.batchTransferFrom(
      dappchainAddress,
      payload.destinationDappchainAddress,
      payload.cardIds,
      payload.amounts)
    .send({ from: ethAddress })
    console.log("transfer cards result", result)
    DPOSTypedStore.setShowLoadingSpinner(false)
    // TODO: this is not working
    CommonTypedStore.setSuccessMsg("Transferring cards success.")
    await plasmaModule.checkCardBalance()
    return result
  } catch (error) {
    DPOSTypedStore.setShowLoadingSpinner(false)
    // TODO: this is not working
    CommonTypedStore.setErrorMsg(`Error Transferring cards: ${error.message}`)
    throw error
  }

}

function createClient(env: {chainId: string, endpoint: string}) {
    const { writer, reader } = setupProtocolsFromEndpoint(env.endpoint)
    return new Client(env.chainId, writer, reader)
}

declare type ActionContext = BareActionContext<PlasmaState, HasPlasmaState>

async function changeIdentity(ctx: ActionContext, id: {signer: PlasmaSigner|null, address: string}) {
    ctx.state.signer = id.signer
    // add the conresponding middleware
    if ( id.signer === null ) {
        ctx.state.client.txMiddleware = []
    } else {
        ctx.state.client.txMiddleware = id.signer.clientMiddleware()
    }
    ctx.state.address = id.address
}

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<TokenSymbol, ERC20> = new Map()

function getErc20Contract(symbol: string): ERC20 {
    // @ts-ignore
    return null
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function updateBalance(context: ActionContext, symbol: TokenSymbol) {
    const contract = getErc20Contract(symbol)
    return timer(2000).toPromise()
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

    const balance = context.state.balances[symbol]
    const weiAmount = tokenAmount
    if (weiAmount.gt(balance)) {
        throw new Error("approval.balance.low")
    }
    const contract: ERC20 = getErc20Contract(symbol)

    contract.functions.approve(to, weiAmount.toString())

    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transferTokens(
    context: ActionContext,
    payload: {
        symbol: string,
        tokenAmount: BN,
        to: string,
    },
) {
    return timer(2000).toPromise()
}

export function trasfertAsset(context: ActionContext,
                              payload: {
        symbol: string,
        to: string,
    },
) {
    return timer(2000).toPromise()
}
