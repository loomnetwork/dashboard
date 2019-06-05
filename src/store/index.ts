import Vue from "vue"
import Vuex, { Store } from "vuex"
// import { state, getters, mutations, actions } from './applicationStore'

import { dposStorePlugin } from "./dposPlugin"
import { LocaleStore } from "./locale"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState, Environment } from "@/types"

import "./locale"
import "./dpos-old"
import "./common"
import "./ethSignStore"
import "./ethereum"
import "./gateway"
import "./plasma"
import "./dpos"
import "./plasma/assets"

import { ethereumReactions } from "./ethereum/reactions"
import { gatewayReactions } from "./gateway/reactions"
import { plasmaReactions } from "./plasma/reactions"
import { dposReactions } from "./dpos/reactions"
import { zbcardsReactions } from "@/store/plasma/assets/reactions"
import { whiteListReaction } from "./whitelist/reactions"

import debug from "debug"
const log = debug("dash")

Vue.use(Vuex)

const builder = getStoreBuilder<DashboardState>()

const dashboardStore = {
  setEnv: builder.commit(function setEnv(state, env: Environment) {
    state.env = env
  }),
  setEnvs: builder.commit(function setEnvs(state, envs: Environment[]) {
    console.log(envs)
    state.envs = envs
  }),
}

const store: Store<DashboardState> = builder.vuexStore({
  plugins: [plugin],
})

// set available envs
if (window.location.host === "dashboard.dappchains.com") {
  dashboardStore.setEnvs(["production"])
} else {
  console.log("all envsxs")
  dashboardStore.setEnvs(["production", "stage", "dev", "custom"])
}

function plugin(store_: Store<DashboardState>) {
  store_.subscribeAction({
    before(action) {
      log("action", action)
    },
  })

  dposStorePlugin(store_)
  ethereumReactions(store_)
  plasmaReactions(store_)
  gatewayReactions(store_)
  dposReactions(store_)
  zbcardsReactions(store_)
  whiteListReaction(store_)
}

export { dashboardStore, store }
