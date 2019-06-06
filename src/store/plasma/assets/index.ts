import { AssetsState, HasAssetsState, AssetsContext } from "./types"
import { getStoreBuilder } from "vuex-typex"
// assets (make this a sepoerate module)
import * as getters from "./getters"
import * as mutations from "./mutations"

import { CardDetail, PackDetail } from "../types"
import { CommonTypedStore } from "@/store/common"
import { getCardByTokenId, formatFromLoomAddress } from "@/utils"
import { PACKS_NAME } from "./reactions"
import { plasmaModule } from ".."
import { DPOSTypedStore } from "@/store/dpos-old"
import debug from "debug"
const log = debug("assets")

function initialState(): AssetsState {
  return {
    packsContract: {},
    cardContract: null,
    cardBalance: [],
    packBalance: [],
    cardToTransferSelected: {
      id: "0",
      amount: 0,
      display_name: "default",
      image: "default",
      title: "default",
      variant: "default",
      variation: "default",
      mould_type: "default",
      element: "default",
      originalID: "default",
    },
    packToTransferSelected: {
      type: "Booster",
      amount: 0,
    },
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
    const card = getCardByTokenId(id.toString())
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
  DPOSTypedStore.setShowLoadingSpinner(true)
  log("transferCards payload", payload)
  try {
    // caller address is either eth if eth signer is there or plasma address i
    const ethAddress = await plasmaModule.getCallerAddress()
    const ethAddressString = ethAddress.local.toString()
    const plasmaAddress = context.rootState.plasma.address
    const result = await context.state
      .cardContract!.methods.batchTransferFrom(
        plasmaAddress,
        formatFromLoomAddress(payload.receiver),
        payload.cardIds,
        payload.amounts,
      )
      // @ts-ignore
      .send({ from: ethAddressString })
    log("transfer cards result", result)
    await assetsModule.checkCardBalance()
    DPOSTypedStore.setShowLoadingSpinner(false)
    CommonTypedStore.setSuccessMsg("message.transfer_card_success_tx" + result.transactionHash)
  } catch (error) {
    DPOSTypedStore.setShowLoadingSpinner(false)
    if (error.message.includes("denied")) {
      CommonTypedStore.setErrorMsg("messages.user_denied_tx")
    } else {
      CommonTypedStore.setErrorMsg(`message.transfer_card_err_tx ${error.message}`)
      throw error
    }
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
  log("transferPacks payload", payload)
  try {
    DPOSTypedStore.setShowLoadingSpinner(true)
    const ethAddress = await plasmaModule.getCallerAddress()
    const ethAddressString = ethAddress.local.toString()
    const receiver = formatFromLoomAddress(payload.receiver)
    const result = await context.state.packsContract[payload.packType].methods
      .transfer(receiver, payload.amount)
      .send({ from: ethAddressString })
    log("transfer packs result", result)
    await assetsModule.checkPackBalance()
    DPOSTypedStore.setShowLoadingSpinner(false)
    CommonTypedStore.setSuccessMsg("message.transfer_pack_success_tx" + result.transactionHash)
  } catch (error) {
    DPOSTypedStore.setShowLoadingSpinner(false)
    if (error.message.includes("denied")) {
      CommonTypedStore.setErrorMsg("messages.user_denied_tx")
    } else {
      CommonTypedStore.setErrorMsg(`message.transfer_pack_err_tx ${error.message}`)
      throw error
    }
  }
}
