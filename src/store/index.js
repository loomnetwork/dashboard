import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, mutations, actions } from './applicationStore'
import DappChainStore from './dappChainStore'
import DPOSStore from './dposStore'
import { EthSignStore } from './ethSignStore'

import { dposStorePlugin } from "./dposPlugin";

Vue.use(Vuex)

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
    DappChain: DappChainStore,
    DPOS: DPOSStore,
    EthSign: EthSignStore
  },
  plugins:[dposStorePlugin]
})
export default store