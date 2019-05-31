import { AssetsState, HasAssetsState, AssetsContext } from "./types"
import { getStoreBuilder } from "vuex-typex"
// assets (make this a sepoerate module)
import * as getters from "./getters"
import * as mutations from "./mutations"

import { CardDetail, PackDetail } from "../types"
import { CommonTypedStore } from "@/store/common"
import { getCardByTokenId } from "@/utils"
import { PACKS_NAME } from "./reactions"
import { plasmaModule } from ".."

function initialState(): AssetsState {
  return {
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
  }
}

const builder = getStoreBuilder<HasAssetsState>().module(
  "assets",
  initialState(),
)
const stateGetter = builder.state()

export const assetsModule = {
  get state() {
    return stateGetter()
  },
  // // Getters
  getCardInstance: builder.read(getters.getCardInstance),
  // Mutations
  setPacksContract: builder.commit(mutations.setPacksContract),
  setCardContract: builder.commit(mutations.setCardContract),
  setCardBalance: builder.commit(mutations.setCardBalance),
  setPackBalance: builder.commit(mutations.setPackBalance),
  setCardToTransferSelected: builder.commit(
    mutations.setCardToTransferSelected,
  ),
  setAllCardsToTransferSelected: builder.commit(
    mutations.setAllCardsToTransferSelected,
  ),
  setPackToTransferSelected: builder.commit(
    mutations.setPackToTransferSelected,
  ),

  // // Actions
  checkCardBalance: builder.dispatch(checkCardBalance),
  checkPackBalance: builder.dispatch(checkPackBalance),
  transferPacks: builder.dispatch(transferPacks),
  transferCards: builder.dispatch(transferCards),
}

async function checkCardBalance(context: AssetsContext) {
  const account = context.rootState.plasma.address
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
  assetsModule.setCardBalance(cards)
}

async function checkPackBalance(context: AssetsContext) {
  const account = context.rootState.plasma.address
  const caller = await plasmaModule.getCallerAddress()
  const packs: PackDetail[] = []

  PACKS_NAME.forEach(async (type) => {
    const amount = await context.state.packsContract[type].methods
      .balanceOf(account)
      .call({ from: caller.local.toString() })
    packs.push({ type, amount })
  })
  assetsModule.setPackBalance(packs)
}

async function transferCards(
  context: AssetsContext,
  payload: {
    cardIds: string[]
    amounts: number[]
    receiver: string,
  },
) {
  console.log("payload", payload)
  try {
    // caller address is either eth if eth signer is there or plasma address i
    const caller = await plasmaModule.getCallerAddress()
    const plasmaAddress = context.rootState.plasma.address
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
    await assetsModule.checkCardBalance()
    return result
  } catch (error) {
    // TODO: this is not working
    CommonTypedStore.setErrorMsg(`Error Transferring cards: ${error.message}`)
    throw error
  }
}

async function transferPacks(
  context: AssetsContext,
  payload: {
    packType: string
    amount: number
    receiver: string,
  },
) {
  try {
    // DPOSTypedStore.setShowLoadingSpinner(true)
    const ethAddress = await plasmaModule.getCallerAddress()
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
