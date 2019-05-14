import Vue from "vue"
import Vuex, { Store } from "vuex"
// import { state, getters, mutations, actions } from './applicationStore'

import { dposStorePlugin } from "./dposPlugin"
import { plasmaStorePlugin } from './plasmaPlugin';
import { LocaleStore } from "./locale"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

import "./locale"
import "./dpos-old"
import "./common"
import "./ethSignStore"
import { DPOSTypedStore } from "./dpos-old"
import { CommonStore } from "./common"
import { EthSign } from "./ethSignStore"

Vue.use(Vuex)

const store = getStoreBuilder<DashboardState>().vuexStore({
  // modules: {
  //   //common: CommonStore,
  //   //DappChain: DappChainStore,
  //   //DPOS: DPOSStore,
  //   //Locale: LocaleStore,
  //   //EthSign: EthSignStore
  // },
  plugins: [dposStorePlugin, plasmaStorePlugin],
})
console.log(store)
export default store
