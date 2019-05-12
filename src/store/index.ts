import Vue from "vue"
import Vuex from "vuex"
// import { state, getters, mutations, actions } from './applicationStore'
import {CommonStore} from "./common"
import { EthSignStore } from "./ethSignStore"

import { dposStorePlugin } from "./dposPlugin"
import { LocaleStore } from "./locale"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"

import "./dpos-old"
import "./dappchain"
import "./common"

Vue.use(Vuex)

const store = getStoreBuilder<DashboardState>().vuexStore({
  // modules: {
  //   //common: CommonStore,
  //   //DappChain: DappChainStore,
  //   //DPOS: DPOSStore,
  //   //Locale: LocaleStore,
  //   //EthSign: EthSignStore
  // },
  plugins: [dposStorePlugin],
})
console.log(store)
export default store

