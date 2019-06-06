import dev from "@/config/dev"
import local from "@/config/local"
import production from "@/config/production"
import stage from "@/config/stage"
import { zbcardsReactions } from "@/store/plasma/assets/reactions"
import { DashboardConfig, DashboardState } from "@/types"
import debug from "debug"
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { getStoreBuilder } from "vuex-typex"
import "./common"
import "./dpos"
import "./dpos-old"
import { dposReactions } from "./dpos/reactions"
// import { state, getters, mutations, actions } from './applicationStore'
import { dposStorePlugin } from "./dposPlugin"
import "./ethereum"
import { ethereumModule } from "./ethereum"
import { ethereumReactions } from "./ethereum/reactions"
import "./ethSignStore"
import "./gateway"
import { gatewayReactions } from "./gateway/reactions"
import "./locale"
import "./plasma"
import { plasmaModule } from "./plasma"
import "./plasma/assets"
import { plasmaReactions } from "./plasma/reactions"
import { whiteListReaction } from "./whitelist/reactions"

const log = debug("dash")

Vue.use(Vuex)

const builder = getStoreBuilder<DashboardState>()

const dashboardStore = {
  setEnv: builder.commit(function setEnv(state, env: DashboardConfig) {
    state.env = env.name
    plasmaModule.setConfig(env.plasma)
    ethereumModule.setConfig(env.ethereum)
  }),
  setEnvs: builder.commit(function setEnvs(state, envs: DashboardConfig[]) {
    console.log(envs)
    state.envs = envs
  }),
}

const store: Store<DashboardState> = builder.vuexStore({
  plugins: [plugin],
})

// set available envs
if (window.location.host === "dashboard.dappchains.com") {
  dashboardStore.setEnvs([production])
} else {
  console.log("all envsxs")
  dashboardStore.setEnvs([production, stage, dev, local])
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
