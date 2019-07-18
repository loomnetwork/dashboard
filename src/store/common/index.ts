import { CommonState } from "./types"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

export const commonState: CommonState = {
  route: null,
  tiers: [],
  errorMsg: null,
  successMsg: null,
  showLoadingSpinner: false,
  alternateBackground: true,
  loadingSpinnerMsg: "",
  userTiers: 0,
}

const builder = getStoreBuilder<DashboardState>().module("common", commonState)
const stateGetter = builder.state()

const CommonTypedStore = {
  get state() {
    return stateGetter()
  },

  setShowLoadingSpinner: builder.commit(setShowLoadingSpinner),

  // actions
}

function setShowLoadingSpinner(state: CommonState, payload: boolean) {
  state.showLoadingSpinner = payload
}

// typed api + plain vuex
export { CommonTypedStore }
