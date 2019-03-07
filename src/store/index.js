import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, mutations, actions } from './applicationStore'
import DappChainStore from './dappChainStore'
import DPOSStore from './dposStore'

Vue.use(Vuex)

const LocaleStore = {
  state: {
    locale: sessionStorage.getItem('locale') || 'en'
  },
  getters: {
    locale(state) {
      return state.locale
    }
  },
  mutations: {
    setLocale(state, locale) {
      state.locale = locale
      sessionStorage.setItem('locale', locale)
    }
  },
  actions: {
    setLocale({ commit }, locale) {
      commit('setLocale', locale)
    }
  }
}
const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
    DappChain: DappChainStore,
    DPOS: DPOSStore,
    Locale: LocaleStore
  }
})
export default store
