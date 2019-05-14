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

Vue.use(Vuex)

const store: Store<DashboardState> = getStoreBuilder<DashboardState>().vuexStore({
  plugins: [dposStorePlugin],
})
console.log(store)
export default store

  // modules: {
  //   //common: CommonStore, ok
  //   //DappChain: DappChainStore, ok
  //   //DPOS: DPOSStore, pok
  //   //Locale: LocaleStore,
  //   //EthSign: EthSignStore ok
  // },