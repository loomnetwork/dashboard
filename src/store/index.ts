import dev from "@/config/dev"
import local from "@/config/local"
import production from "@/config/production"
import stage from "@/config/stage"

import debug from "debug"
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { getStoreBuilder } from "vuex-typex"

import { tokenService } from "@/services/TokenService"

import "@/feedback/store"
import { zbcardsReactions } from "@/store/plasma/assets/reactions"

import "./ethereum"
import { ethereumModule } from "./ethereum"
import { ethereumReactions } from "./ethereum/reactions"

import "./plasma"
import { plasmaModule } from "./plasma"

import "./gateway"
import { gatewayReactions } from "./gateway/reactions"

import "@/dpos/store"
import { dposReactions } from "@/dpos/store/reactions"

import { DashboardConfig, DashboardState } from "@/types"

import "@/whitelist/store"
import { whiteListReaction } from "../whitelist/store/reactions"

import "./common"
import "./dpos-old"

import "./locale"
import "./plasma/assets"

import { plasmaReactions } from "./plasma/reactions"
import { dposModule } from "@/dpos/store"

const log = debug("dash")

Vue.use(Vuex)

const builder = getStoreBuilder<DashboardState>()

const dashboardStore = {
  setEnv: builder.commit(function setEnv(state, env: DashboardConfig) {
    state.env = env.name
    plasmaModule.setConfig(env.plasma)
    ethereumModule.setConfig(env.ethereum)
    dposModule.setConfig(env.dpos)
    log("tokensService", env.coinDataUrl)
    tokenService.setBaseURL(env.coinDataUrl)
    state.disabled = env.disabled
  }),
  setEnvs: builder.commit(function setEnvs(state, envs: DashboardConfig[]) {
    state.envs = envs
  }),
}

const store: Store<DashboardState> = builder.vuexStore({
  plugins: [plugin],
})

// set available envs
if (window.location.host === "dashboard.dappchains.com") {
  dashboardStore.setEnvs([production])
  dashboardStore.setEnv(production)
} else {
  console.log("all envsxs")
  dashboardStore.setEnvs([production, stage, dev, local])
  // default
  dashboardStore.setEnv(stage)
}

function plugin(store_: Store<DashboardState>) {
  store_.subscribeAction({
    before(action) {
      log("action %s payload", action.type, action.payload)
    },
  })

  // dposStorePlugin(store_)
  ethereumReactions(store_)
  plasmaReactions(store_)
  gatewayReactions(store_)
  dposReactions(store_)
  zbcardsReactions(store_)
  whiteListReaction(store_)
}

export { dashboardStore, store }
