import Vue from 'vue'
import Vuex from 'vuex'
import { state, getters, mutations, actions } from './applicationStore'
import DappChainStore from './dappChainStore'
import {DPOSStore} from './dpos-old'
import { EthSignStore } from './ethSignStore'

import { dposStorePlugin } from "./dposPlugin";
import { LocaleStore } from './locale';
import { getStoreBuilder } from 'vuex-typex';
import { DashboardState } from '@/types';

Vue.use(Vuex)

const store = getStoreBuilder<DashboardState>().vuexStore({
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
  plugins:[dposStorePlugin]
})

export default store

