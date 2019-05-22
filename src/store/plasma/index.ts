/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"

import { PlasmaState, CardDetail, PackDetail } from "./types"
import BN from "bn.js"
import { TokenSymbol } from "../ethereum/types";
import * as getters from "./getters"
import * as mutations from "./mutations"
import { noop } from "vue-class-component/lib/util"
import { DashboardState } from '@/types';
import { getCardByTokenId } from "@/utils"
import { PACKS_NAME } from '../plasmaPlugin';
import { CommonTypedStore } from '../common';

const initialState: PlasmaState = {
    // not state but...
    client: null,
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

    // mutation
    setPacksContract: builder.commit(mutations.setPacksContract),
    setCardContract:  builder.commit(mutations.setCardContract),
    setCardBalance: builder.commit(mutations.setCardBalance),
    setPackBalance: builder.commit(mutations.setPackBalance),
    setCardToTransferSelected: builder.commit(mutations.setCardToTransferSelected),
    setAllCardsToTransferSelected: builder.commit(mutations.setAllCardsToTransferSelected),
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
  const dposUser = await context.rootState.DPOS.dposUser
  const account = dposUser!.loomAddress.local.toString()
  const result = await context.state.packsContract[payload.packType].methods
          .transfer(payload.destinationDappchainAddress, payload.amount)
          .send({ from: account })
  return result
}

async function transferCards(
  context: ActionContext,
  payload: {
    cardIds: string[],
    amounts: number[],
    destinationDappchainAddress: string}) {
  console.log("payload", payload)
  try {
    const dposUser = await context.rootState.DPOS.dposUser
    const dappchainAccount = dposUser!.loomAddress.local.toString()
    const ethAccount = dposUser!.ethAddress
    console.log("ethAddr", ethAccount);
    const result = await context.state.cardContract!.methods.batchTransferFrom(
      dappchainAccount,
      payload.destinationDappchainAddress,
      payload.cardIds,
      payload.amounts)
    .send({ from: ethAccount })
    console.log("reult", result);
    
    return result
  } catch (error) {
    CommonTypedStore.setErrorMsg(`Error Transferring cards: ${error.message}`)
    throw error
  }
}

function createClient() {
    noop()
}
