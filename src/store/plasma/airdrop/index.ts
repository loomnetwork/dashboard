import { AirdropState, HasAirdropState, AirdropContext } from "./types"
import { getStoreBuilder } from "vuex-typex"
// airdrop (make this a sepoerate module)
import * as getters from "./getters"
import * as mutations from "./mutations"

import { CardDetail, PackDetail } from "../types"
import { getCardByTokenId, formatFromLoomAddress } from "@/utils"
import { plasmaModule } from ".."
import { i18n } from "@/i18n"
import debug from "debug"
import { feedbackModule } from "@/feedback/store"
const log = debug("airdrop")

function initialState(): AirdropState {
  return {
    airdropContract: null,
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

  // // Actions
}

// export async function checkCardBalance(context: AirdropContext) {
//   const account = context.rootState.plasma.address
//   const caller = await plasmaModule.getCallerAddress()

//   const tokens = await context.state
//     .cardContract!.methods.tokensOwned(account)
//     // @ts-ignore
//     .call({ from: caller.local.toString() })
//   const cards: CardDetail[] = []
//   tokens.indexes.forEach((id: string, i: number) => {
//     const card = getCardByTokenId(id.toString())
//     card.amount = parseInt(tokens.balances[i], 10)
//     cards.push(card)
//   })
//   airdropModule.setCardBalance(cards)
// }
