const { LoomProvider, CryptoUtils, Client, LocalAddress } = require('loom-js')
import { formatToCrypto } from '../utils.js'
import { initWeb3 } from '../services/initWeb3'

const defaultState = () => {
  return {
    isLoggedIn: false,
    showSidebar: false,
    connectedToMetamask: false,
    web3: undefined,
    currentMetmaskAddress: undefined,
    validators: [],
    status: "check_mapping",
    metamaskDisabled: false,
    showLoadingSpinner: false,
    userBalance: {
      loomBalance: 0,
      mainnetBalance: 0,
      stakedAmount: 0
    }
  }
}

/* eslint-disable */
export default {
  namespaced: true,
  state: defaultState(),
  getters: {},
  mutations: {
    setIsLoggedIn(state, payload) {
      state.isLoggedIn = payload
    },
    setShowSidebar(state, payload) {
      state.showSidebar = payload
    },
    setConnectedToMetamask(state, payload) {
      state.connectedToMetamask = payload
    },
    setWeb3(state, payload) {
      state.web3 = payload
    },
    setUserBalance(state, payload) {
      state.userBalance = payload
    },
    setValidators(state, payload) {
      state.validators = payload
    },
    setCurrentMetmaskAddress(state, payload) {
      state.currentMetmaskAddress = payload
    },
    setStatus(state, payload) {
      state.status = payload
    },
    setMetamaskDisabled(state, payload) {
      state.metamaskDisabled = payload
    },
    setShowLoadingSpinner(state, payload) {
      state.showLoadingSpinner = payload
    }
  },
  actions: {
    async initializeDependencies({ commit, dispatch }, payload) {
      commit("setShowLoadingSpinner", true)
      try {
        let web3js = await initWeb3()
        commit("setConnectedToMetamask", true)
        commit("setWeb3", web3js, null)
        let accounts = await web3js.eth.getAccounts()
        let metamaskAccount = accounts[0]
        commit("setCurrentMetmaskAddress", metamaskAccount)
        await dispatch("DappChain/init", null, { root: true })
        await dispatch("DappChain/registerWeb3", {web3: web3js}, { root: true })
        await dispatch("DappChain/initDposUser", null, { root: true })
        await dispatch("DappChain/ensureIdentityMappingExists", null, { root: true })
      } catch(err) {
        this._vm.$log(err)
        if(err === "no Metamask installation detected") {
          commit("setMetamaskDisabled", true)
        }
        commit("setErrorMsg", {msg: "An error occurred, please refresh the page", forever: false}, { root: true })
      }
      commit("setShowLoadingSpinner", false)
    },
    async storePrivateKeyFromSeed({ commit }, payload) {
      const privateKey = CryptoUtils.generatePrivateKeyFromSeed(payload.seed.slice(0, 32))
      const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
      localStorage.setItem('privatekey', privateKeyString)
      commit('setIsLoggedIn', true)
    },
    async clearPrivateKey({ commit }, payload) {
      localStorage.removeItem('privatekey')
      commit('setIsLoggedIn', false)
    },
    async checkIfConnected({state, dispatch}) {        
      if(!state.web3) await dispatch("initWeb3")
    },
    async initWeb3({rootState, dispatch, commit}) {    
      let web3js
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        web3js = new Web3(ethereum)
        try {
          await ethereum.enable();
        } catch (err) {
          dispatch("setError", "User denied access to Metamask", {root: true})
          return
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
        web3js = new Web3(window.web3.currentProvider)
      } else {
        dispatch("setError", 'Metamask is not Enabled', {root: true})
      }      
      commit("setWeb3", web3js)
    },
    async getValidatorList({dispatch, commit}) {
      try {
        const validators = await dispatch("DappChain/getValidatorsAsync", null, {root: true})
        if (validators.length === 0) {
          return null
        }
        const validatorList = []
        for (let i in validators) {
          const validator = validators[i]
          const validatorName = validators[i].name == "" ? "Validator #" + (parseInt(i) + 1) : validators[i].name
          validatorList.push({
            Name: validatorName,
            Address: validator.address,
            Status: validator.active ? "Active" : "Inactive",
            Stake: (formatToCrypto(validator.stake) || '0'),
            Weight: (validator.weight || '0') + '%',
            Fees: (validator.fee || '0') + '%',
            Uptime: (validator.uptime || '0') + '%',
            Slashes: (validator.slashes || '0') + '%',
            Description: (validator.description) || null,
            Website: (validator.website) || null,
            _cellVariants: validator.active ? { Status: 'active'} : undefined,
            pubKey: (validator.pubKey)
          })
        }
        commit("setValidators", validatorList)
        return validatorList
      } catch(err) {
        console.log(err)
        dispatch("setError", "Fetching validators failed", {root: true})        
      }
    } 
  }
}
