import Vue from "vue"
import Vuex, { Store } from "vuex"
// import { state, getters, mutations, actions } from './applicationStore'

import { dposStorePlugin } from "./dposPlugin"
import { LocaleStore } from "./locale"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

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
import { whiteListReaction } from "./whitelist/reactions";

Vue.use(Vuex)

const store: Store<DashboardState> = getStoreBuilder<
  DashboardState
>().vuexStore({
  plugins: [
    (store_) => {
      dposStorePlugin(store_)
      ethereumReactions(store_)
      plasmaReactions(store_)
      gatewayReactions(store_)
      dposReactions(store_)
      zbcardsReactions(store_)
      whiteListReaction(store_)
    },
  ],
})
export default store
