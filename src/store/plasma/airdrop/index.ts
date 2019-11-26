import { AirdropState, HasAirdropState, AirdropContext } from "./types"
import { getStoreBuilder } from "vuex-typex"
// airdrop (make this a sepoerate module)
import * as getters from "./getters"
import * as mutations from "./mutations"

import { CardDetail, PackDetail, AirdropDetail } from "../types"
import { getCardByTokenId, formatFromLoomAddress } from "@/utils"
import { plasmaModule } from ".."
import { i18n } from "@/i18n"
import debug from "debug"
import { feedbackModule } from "@/feedback/store"
const log = debug("airdrop")
import { feedbackModule as feedback } from "@/feedback/store"

function initialState(): AirdropState {
  return {
    airdropContract: null,
    usersAirdrops: [],
  }
}

const builder = getStoreBuilder<HasAirdropState>().module(
  "airdrop",
  initialState(),
)
const stateGetter = builder.state()

export const airdropModule = {
  get state() {
    return stateGetter()
  },
  // // Getters
  getAirdropInstance: builder.read(getters.getAirdropInstance),
  // Mutations
  setAirdropContract: builder.commit(mutations.setAirdropContract),
  setUsersAirdrops: builder.commit(mutations.setUsersAirdrops),

  // // Actions
  fetchAirdrop: builder.dispatch(fetchAirdrop),
  withdrawAirdrop: builder.dispatch(withdrawAirdrop),
  isAirdropWithdrew: builder.dispatch(isAirdropWithdrew),
}

export async function fetchAirdrop(context: AirdropContext) {
  const account = context.rootState.plasma.address
  const caller = await plasmaModule.getCallerAddress()

  const airdropLength = await context.state.airdropContract!.methods.getAirdropLengthByUserAddress(account)
    // @ts-ignore
    .call({ from: caller.local.toString() })
  const usersAirdrops: AirdropDetail[] = []
  for (let index = 0; index < airdropLength; index++) {
    const airdropObject = await context.state.airdropContract!.methods.airdropPerUser(account, index)
      .call({ from: caller.local.toString() })
    const isWithdrew = await airdropModule.isAirdropWithdrew({airdropID: airdropObject.airdropID})
    airdropObject.isWithdrew = isWithdrew
    usersAirdrops.push(airdropObject)
  }
  airdropModule.setUsersAirdrops(usersAirdrops)
}

export async function withdrawAirdrop(context: AirdropContext, payload: {airdropID: number}) {
  const caller = await plasmaModule.getCallerAddress()
  try {
    const tx = await context.state.airdropContract!.methods.withdrawAirdrop(payload.airdropID)
      .send({ from: caller.local.toString() })
    feedback.showSuccess(i18n.t("feedback_msg.success.withdraw_airdrop_success").toString())
  } catch (error) {
    if (error.message.includes("denied")) {
      feedbackModule.showError(i18n.t("messages.user_denied_tx").toString())
    } else {
      feedback.showError(i18n.t("feedback_msg.error.err_while_withdraw_airdrop").toString())
    }
    console.error(error)
  }
}

export async function isAirdropWithdrew(context: AirdropContext, payload: {airdropID: number}) {
  const caller = await plasmaModule.getCallerAddress()
  const isWithdrew = await context.state.airdropContract!.methods.airdropWithdrawals(payload.airdropID)
    // @ts-ignore
    .call({ from: caller.local.toString() })
  return isWithdrew
}
