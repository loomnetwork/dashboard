import Vue from "vue"
import Vuex, { Store } from "vuex"
// import { state, getters, mutations, actions } from './applicationStore'

import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

import "./locale"
import "./dpos-old"
import "./common"
import "./ethSignStore"
import { LocaleStore } from "./locale"
import { DPOSTypedStore } from "./dpos-old"
import { CommonStore } from "./common"
import { EthSign } from "./ethSignStore"
import { dposStorePlugin } from "./dposPlugin"
import "./ethereum"
import "./gateway"
import "./plasma"
import "./dpos"
import { ethGatewayPlugin } from "./gateway/reactions"
import { gatewayModule } from "./gateway/index"
import { ethereumReactions } from "./ethereum/reactions"
import { plasmaReactions } from "./plasma/reactions"
import { dposReactions } from "./dpos/reactions"

Vue.use(Vuex)

const store: Store<DashboardState> = getStoreBuilder<DashboardState>().vuexStore({
  plugins: [
    dposStorePlugin,
    ethereumReactions,
    plasmaReactions,
    ethGatewayPlugin,
    dposReactions,
  ],
})
console.log(store)
export default store

