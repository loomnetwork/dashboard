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
import { DPOSTypedStore } from "./dpos-old"
import { CommonStore } from "./common"
// import { EthSign } from "./ethSignStore"
import "./ethereum"
import "./gateway"
import "./plasma"
import "./dpos"
import { ethereumReactions } from "./ethereum/reactions"
import { ethGatewayPlugin } from "./gateway/reactions"
import { plasmaReactions } from "./plasma/reactions"
import { dposReactions } from "./dpos/reactions"
import { zbcardsReactions } from "@/store/plasma/assets/reactions"

Vue.use(Vuex)

const store: Store<DashboardState> = getStoreBuilder<
  DashboardState
>().vuexStore({
  plugins: [
    // dposStorePlugin,
    ethereumReactions,
    plasmaReactions,
    ethGatewayPlugin,
    dposReactions,
    zbcardsReactions,
  ],
})
export default store
