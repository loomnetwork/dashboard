import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, mutations, actions } from './applicationStore'
import DappChainStore from './dappChainStore'
import DPOSStore from './dposStore'

Vue.use(Vuex)
const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
    DappChain: DappChainStore,
    DPOS: DPOSStore
  }
})
export default store
