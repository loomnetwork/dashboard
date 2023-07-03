import { AssetsState, HasAssetsState, AssetsContext } from "./types"
import { getStoreBuilder } from "vuex-typex"
// assets (make this a sepoerate module)
import * as getters from "./getters"
import * as mutations from "./mutations"

import { CardDetail, PackDetail } from "../types"
import { getCardByTokenId, formatFromLoomAddress } from "@/utils"
import { PACKS_NAME } from "./reactions"
import { plasmaModule } from ".."
import { i18n } from "@/i18n"
import debug from "debug"
import { feedbackModule } from "@/feedback/store"
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

export async function checkCardBalance(context: AssetsContext) {
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

export async function checkPackBalance(context: AssetsContext) {
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

export async function transferCards(
  context: AssetsContext,
  payload: {
    cardIds: string[]
    amounts: number[]
    receiver: string,
  },
) {
  feedbackModule.setTask(i18n.t("feedback_msg.task.batch_transfer").toString())
  feedbackModule.setStep(i18n.t("feedback_msg.step.transfering_card").toString())
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
    feedbackModule.endTask()
    feedbackModule.showSuccess(
      i18n
        .t("messages.transfer_card_success_tx", {
          transactionHash: result.transactionHash,
        })
        .toString(),
    )
  } catch (error) {
    feedbackModule.endTask()
    if ((error as Error).message.includes("denied")) {
      feedbackModule.showError(i18n.t("messages.user_denied_tx").toString())
    } else {
      feedbackModule.showError(
        i18n
          .t("messages.transfer_card_err_tx", { msg: (error as Error).message })
          .toString(),
      )
      throw error
    }
  }
}

export async function transferPacks(
  context: AssetsContext,
  payload: {
    packType: string
    amount: number
    receiver: string,
  },
) {
  log("transferPacks payload", payload)
  try {
    feedbackModule.setTask(i18n.t("feedback_msg.task.pack_transfer").toString())
    feedbackModule.setStep(i18n.t("feedback_msg.step.transfering_pack").toString())
    const ethAddress = await plasmaModule.getCallerAddress()
    const ethAddressString = ethAddress.local.toString()
    const receiver = formatFromLoomAddress(payload.receiver)
    const result = await context.state.packsContract[payload.packType].methods
      .transfer(receiver, payload.amount)
      .send({ from: ethAddressString })
    log("transfer packs result", result)
    feedbackModule.setStep(i18n.t("feedback_msg.step.refresh_balance").toString())
    await assetsModule.checkPackBalance()

    feedbackModule.endTask()
    feedbackModule.showSuccess(
      i18n
        .t("messages.transfer_pack_success_tx", {
          transactionHash: result.transactionHash,
        })
        .toString(),
    )
  } catch (error) {
    feedbackModule.endTask()
    if ((error as Error).message.includes("denied")) {
      feedbackModule.showError(i18n.t("messages.user_denied_tx").toString())
    } else {
      feedbackModule.showError(
        i18n
          .t("messages.transfer_pack_err_tx", { msg: (error as Error).message })
          .toString(),
      )
      throw error
    }
  }
}
