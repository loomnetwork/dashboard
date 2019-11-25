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
  checkAirdrop: builder.dispatch(checkAirdrop),
}

export async function checkAirdrop(context: AirdropContext) {
  const account = context.rootState.plasma.address
  const caller = await plasmaModule.getCallerAddress()

  const airdropLength = await context.state.airdropContract!.methods.getAirdropLengthByUserAddress(account)
    // @ts-ignore
    .call({ from: caller.local.toString() })
  const usersAirdrops: AirdropDetail[] = []
  for (let index = 0; index < airdropLength; index++) {
    const airdropObject = await context.state.airdropContract!.methods.airdropPerUser(index)
    usersAirdrops.push(airdropObject)
  }
  airdropModule.setUsersAirdrops(usersAirdrops)
}
