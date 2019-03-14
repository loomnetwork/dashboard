import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, mutations, actions } from './applicationStore'
import DappChainStore from './dappChainStore'
import DPOSStore from './dposStore'
import { EthSignStore } from './ethSignStore'

import { dposStorePlugin } from './dposPlugin'

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
		Locale: LocaleStore,
		EthSign: EthSignStore
	},
	plugins: [ dposStorePlugin ]
})
export default store
