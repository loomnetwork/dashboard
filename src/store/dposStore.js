const { LoomProvider, CryptoUtils, Client, LocalAddress } = require('loom-js')
import { formatToCrypto } from '../utils.js'
import { initWeb3 } from '../services/initWeb3'



const dynamicSort = (property) => {
  let sortOrder = 1
  if(property[0] === "-") {
      sortOrder = -1
      property = property.substr(1)
  }
  return (a,b) => {
    let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
    return result * sortOrder
  }
}

const defaultState = () => {
  return {
    isLoggedIn: false,
    showSidebar: false,
    connectedToMetamask: false,
    web3: undefined,
    currentMetamaskAddress: undefined,
    validators: [],
    status: "check_mapping",
    metamaskDisabled: false,
    showLoadingSpinner: false,
    userBalance: {
      loomBalance: 0,
      mainnetBalance: 0,
      stakedAmount: 0
    },
    rewardsResults: null,
    timeUntilElectionCycle: null,
    prohibitedNodes: ["plasma-0", "plasma-1", "plasma-2", "plasma-3", "Validator #4"]
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
    setCurrentMetamaskAddress(state, payload) {
      state.currentMetamaskAddress = payload
    },
    setStatus(state, payload) {
      state.status = payload
    },
    setMetamaskDisabled(state, payload) {
      state.metamaskDisabled = payload
    },
    setShowLoadingSpinner(state, payload) {
      state.showLoadingSpinner = payload
    },
    setRewardsResults(state, payload) {
      state.rewardsResults = payload
    },
    setTimeUntilElectionCycle(state, payload) {
      state.timeUntilElectionCycle = payload
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
        commit("setCurrentMetamaskAddress", metamaskAccount)
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
        commit("setShowLoadingSpinner", false)
        throw err
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

          let weight = 0
          if(validators[i].name.startsWith("plasma-")) 
          {
            weight = 1
          } else if(validators[i].name === "") {
            weight = 2
          }

          const validator = validators[i]
          const validatorName = validators[i].name == "" ? "Validator #" + (parseInt(i) + 1) : validators[i].name
          validatorList.push({
            Name: validatorName,
            Address: validator.address,
            Status: validator.active ? "Active" : "Inactive",
            Stake: (formatToCrypto(validator.stake) || '0'),
            Weight: (validator.weight || '0') + '%',
            Fees: (validator.fee/100 || '0') + '%',
            Uptime: (validator.uptime || '0') + '%',
            Slashes: (validator.slashes || '0') + '%',
            Description: (validator.description) || null,
            Website: (validator.website) || null,
            Weight: weight || 0,            
            _cellVariants: validator.active ? { Status: 'active'} : undefined,
            pubKey: (validator.pubKey)
          })

        }
        validatorList.sort(dynamicSort("Weight"))
        commit("setValidators", validatorList)
        return validatorList
      } catch(err) {
        this._vm.$log(err)
        dispatch("setError", "Fetching validators failed", {root: true})        
      }
    },
    async queryRewards({ rootState, dispatch, commit }) {
      
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const user = rootState.DappChain.dposUser
      
      try {
        const result = await user.checkRewardsAsync()
        commit("setRewardsResults", result)        
      } catch(err) {
        this._vm.$log(err)
        commit("setErrorMsg", {msg: err.toString(), forever: false}, {root: true})
      }
      
    },

    async claimRewardsAsync({ rootState, dispatch }, payload) {
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const user = rootState.DappChain.dposUser

      try {
        await user.claimDelegationsAsync()
      } catch(err) {
        console.log(err)
      }
      
    },    

    async getTimeUntilElectionsAsync({ rootState, dispatch, commit }) {
      
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const user = rootState.DappChain.dposUser

      try {
        const result = await user.getTimeUntilElectionsAsync()
        commit("setTimeUntilElectionCycle", result.toString())
      } catch(err) {
        this._vm.$log(err)
      }

    }

  }


}
