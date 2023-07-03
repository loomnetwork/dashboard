import dev from "@/config/dev"
import local from "@/config/local"
import production from "@/config/production"

import debug from "debug"
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { getStoreBuilder } from "vuex-typex"

import "@/feedback/store"
import { zbcardsReactions } from "@/store/plasma/assets/reactions"

import "./ethereum"
import { ethereumModule } from "./ethereum"
import { ethereumReactions } from "./ethereum/reactions"

import { plasmaModule } from "./plasma"

import "./gateway"
import { gatewayReactions } from "./gateway/reactions"

import "@/dpos/store"
import { dposReactions } from "@/dpos/store/reactions"

import { DashboardConfig, DashboardState } from "@/types"

import "@/whitelist/store"
import { whiteListReaction } from "../whitelist/store/reactions"

import "./common"

import "./locale"
import "./plasma/assets"

import { plasmaReactions } from "./plasma/reactions"
import { dposModule } from "@/dpos/store"
import { gatewayModule } from "./gateway"

const log = debug("dash")

Vue.use(Vuex)

const builder = getStoreBuilder<DashboardState>()

const dashboardStore = {
  setEnv: builder.dispatch(async function setEnv(context, env: DashboardConfig) {
    context.state.env = env.name
    plasmaModule.setConfig(env.plasma)
    ethereumModule.setConfig(env.ethereum)
    dposModule.setConfig(env.dpos)
    gatewayModule.setConfig(env.gateway)
    context.state.disabled = env.disabled
    context.state.chains = env.chains
    context.state.activeConfig = env
  }),
  setEnvs: builder.commit(function setEnvs(state, envs: DashboardConfig[]) {
    state.envs = envs
  }),
}
const store: Store<DashboardState> = builder.vuexStore({
  plugins: [plugin],
})

function plugin(store_: Store<DashboardState>) {
  store_.subscribeAction({
    before(action) {
      log("action %s payload", action.type, action.payload)
    },
  })

  ethereumReactions(store_)
  plasmaReactions(store_)
  gatewayReactions(store_)
  dposReactions(store_)
  zbcardsReactions(store_)
  whiteListReaction(store_)
}

export { dashboardStore, store }
