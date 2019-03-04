const { LoomProvider, CryptoUtils, Client, LocalAddress } = require('loom-js')
import { formatToCrypto } from '../utils'
import { initWeb3 } from '../services/initWeb3'
import BigNumber from 'bignumber.js';



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
    showSidebar: true,
    connectedToMetamask: false,
    web3: undefined,
    currentMetamaskAddress: undefined,
    validators: null,
    status: "check_mapping",
    walletType: undefined,
    selectedAccount: undefined,
    metamaskDisabled: false,
    showLoadingSpinner: false,
    showSignWalletModal: false,
    showAlreadyMappedModal: false,
    mappingSuccess: false,
    userBalance: {
      isLoading: true,
      loomBalance: 0,
      mainnetBalance: 0,
      stakedAmount: 0
    },
    rewardsResults: null,
    timeUntilElectionCycle: null,
    validatorFields: [
      { key: 'Name', sortable: true },
      { key: 'Status', sortable: true },
      { key: 'totalStaked', sortable: true, label: "Total Staked" },
      // { key: 'votingPower', sortable: true, label: "Reward Power" },
      // { key: 'Weight', sortable: true },
      { key: 'Fees', sortable: true },
      // { key: 'Uptime', sortable: true },
      // { key: 'Slashes', sortable: true },
    ],
    prohibitedNodes: ["plasma-0", "plasma-1", "plasma-2", "plasma-3", "plasma-4", "Validator #4", "test-z-us1-dappchains-2-aws0"]
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
    setSignWalletModal(state, payload) {
      state.showSignWalletModal = payload
    },
    setAlreadyMappedModal(state, payload) {
      state.showAlreadyMappedModal = payload
    },
    setMappingSuccess(state, payload) {
      state.mappingSuccess = payload
    },
    setRewardsResults(state, payload) {
      state.rewardsResults = payload
    },
    setTimeUntilElectionCycle(state, payload) {
      state.timeUntilElectionCycle = payload
    },
    setWalletType(state, payload) {
      state.walletType = payload
      localStorage.setItem("walletType", payload)
      localStorage.setItem("selectedLedgerPath", null)      
    },
    setSelectedAccount(state, payload) {
      state.selectedAccount = payload
    },
    setSelectedLedgerPath(state, payload) {
      state.selectedLedgerPath = payload
      localStorage.removeItem("selectedLedgerPath")
    }
  },
  actions: {
    async initializeDependencies({ state, commit, dispatch }, payload) {
      commit("setShowLoadingSpinner", true)
      try {
        await dispatch("initWeb3Local")
        await dispatch("DappChain/initDposUser", null, { root: true })
        await dispatch("DappChain/ensureIdentityMappingExists", null, { root: true })
        await dispatch("checkMappingAccountStatus")

      } catch(err) {
        if(err.message === "no Metamask installation detected") {
          commit("setMetamaskDisabled", true)
        }
        commit("setErrorMsg", {msg: "An error occurred, please refresh the page", forever: false, report: true, cause: err}, { root: true })
        commit("setShowLoadingSpinner", false)
        throw err
      }      
      commit("setShowLoadingSpinner", false)
    },
    async checkMappingAccountStatus({ state, commit, dispatch }) {
      commit("setSignWalletModal", false)
      commit("setAlreadyMappedModal", false)
      if (state.status == 'no_mapping' && state.mappingError == undefined) {
        try {
          commit("setSignWalletModal", true)
          commit("setShowLoadingSpinner", true)
          await dispatch("DappChain/addMappingAsync", null, { root: true })
          commit("setShowLoadingSpinner", false)
          commit("setMappingSuccess", true)
        } catch(err) {
          commit("setSignWalletModal", false)
          commit("setAlreadyMappedModal", true)
        }
      } else if((state.status == 'no_mapping' && state.mappingError !== undefined)) {
        commit("setAlreadyMappedModal", true)
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
    async initWeb3Local({commit, state, dispatch}){
      if(state.walletType === "metamask") {
        let web3js = await initWeb3()
        let accounts = await web3js.eth.getAccounts()
        let metamaskAccount = accounts[0]
        commit("setWeb3", web3js)
        commit("setCurrentMetamaskAddress", metamaskAccount)
      } else if(state.walletType === "ledger") {
        if(selectedLedgerPath) {
          let web3js = await initWeb3SelectedWallet(selectedLedgerPath)
          commit("setWeb3", web3js)
        } else {
          throw "No HD path selected"
        }
      }
      commit("setConnectedToMetamask", true)  
      await dispatch("DappChain/init", null, { root: true })
      await dispatch("DappChain/registerWeb3", {web3: state.web3}, { root: true })
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
    async getValidatorList({dispatch, commit, state}) {
      try {
        const validators = await dispatch("DappChain/getValidatorsAsync", null, {root: true})
        if (validators.length === 0) {
          return null
        }
        const validatorList = []
        for (let i in validators) {

          let weight = 0
          if ( validators[i].name.startsWith("plasma-") )  {
            weight = 1
          } else if( validators[i].name === "" ) {
            weight = 2
          }

          const validator = validators[i]

          // Check if bootstrap val
          const validatorName = validator.name !== "" ? validator.name : validator.address
          const isBootstrap = state.prohibitedNodes.includes(validatorName)
          validatorList.push({
            Address: validator.address,
            pubKey: (validator.pubKey),
            // Active / Inactive validator
            Status: validator.active ? "Active" : "Inactive",

            totalStaked: formatToCrypto(validator.totalStaked),

            delegationsTotal: formatToCrypto(validator.delegationsTotal),

            personalStake: formatToCrypto(validator.personalStake),

            delegatedStake: formatToCrypto(validator.delegatedStake),

            // Whitelist + Tokens Staked * Bonuses
            votingPower: formatToCrypto(validator.votingPower || 0),


            // Validator MEtadata
            Name: validatorName,
            Description: (validator.description) || null,
            Website: (validator.website) || null,
            Fees: isBootstrap ? 'N/A' : (validator.fee  || '0') + '%',

            isBootstrap,
            Weight: weight || 0,            
            _cellVariants:  {
              Status: validator.active ? 'active' : 'inactive',
              Name:  isBootstrap ? "danger" : undefined
            },
            // UNUSED VARIABLES !!!
            // Weight: (validator.weight || '0') + '%',
            // Uptime: (validator.uptime || '0') + '%',
            // Slashes: (validator.slashes || '0') + '%',
          })

        }
        validatorList.sort(dynamicSort("Weight"))
        commit("setValidators", validatorList)
      } catch(err) {
        console.error(err)
        commit("setValidators", [])
        dispatch("setError", {msg:"Fetching validators failed",report:true,cause:err}, {root: true})        
      }
    },
    async queryRewards({ rootState, dispatch, commit }) {
      
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const user = rootState.DappChain.dposUser
      
      try {
        const result = await user.checkRewardsAsync()
        const formattedResult = formatToCrypto(result)
        commit("setRewardsResults", formattedResult)
      } catch(err) {
        commit("setErrorMsg", {msg: "Failed querying rewards", forever: false,report:true,cause:err}, {root: true})
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
        console.error(err)
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
        console.error(err)
      }

    },

    async redelegateAsync({ rootState, dispatch, commit }, payload) {
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const { origin, target, validator, amount} = payload
      const user = rootState.DappChain.dposUser

      try {
        await user.redelegateAsync(origin, validator, amount)
        commit("setSuccessMsg", {msg: "Success redelegating stake", forever: false}, {root: true})
      } catch(err) {
        console.error(err)
        commit("setErrorMsg", {msg: "Failed to redelegate stake", forever: false,report:true,cause:err}, {root: true})
      }

    }

  }


}
