import axios from 'axios'
const { LoomProvider, CryptoUtils, Client, LocalAddress } = require('loom-js')
import { formatToCrypto } from '../utils'
import { initWeb3 } from '../services/initWeb3'
import BigNumber from 'bignumber.js';

import Debug from "debug"

Debug.enable("dashboard.dpos")
const debug = Debug("dashboard.dpos")

const DAILY_WITHDRAW_LIMIT = 500000

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
    history: null,
    withdrawLimit: DAILY_WITHDRAW_LIMIT,
    validators: [],
    status: "check_mapping",
    walletType: undefined,
    selectedAccount: undefined,
    metamaskDisabled: false,
    showLoadingSpinner: false,
    showSignWalletModal: false,
    showAlreadyMappedModal: false,
    mappingSuccess: false,
    gatewayBusy: false,
    userBalance: {
      isLoading: true,
      loomBalance: 0,
      mainnetBalance: 0,
      stakedAmount: 0
    },
    rewardsResults: null,
    timeUntilElectionCycle: null,
    // timestamp millis
    nextElectionTime: 0,
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
    prohibitedNodes: ["plasma-0", "plasma-1", "plasma-2", "plasma-3", "plasma-4", "Validator #4", "test-z-us1-dappchains-2-aws0"],
    latestBlockNumber: null,
    cachedEvents: [],
    dappChainEventUrl: "http://dev-api.loom.games/plasma/address",
    historyPromise: null,
    dappChainEvents: [],
    states: ["Bonding", "Bonded", "Unbounding", "Redelegating"],
    delegations: [],
  }
}

/* eslint-disable */
export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getLatestBlockNumber(state) {
      return state.latestBlockNumber || JSON.parse(sessionStorage.getItem("latestBlockNumber"))
    },
    getCachedEvents(state) {
      return state.cachedEvents || JSON.parse(sessionStorage.getItem("cachedEvents")) || []
    },
    getFormattedValidators(state, getters, rootState) {

      return rootState.DappChain.validators.map((validator) => {

        let Weight = 0
        if ( validator.name.startsWith("plasma-") )  {
          Weight = 1
        } else if( validator.name === "" ) {
          Weight = 2
        }
        // Check if bootstrap val
        const validatorName = validator.name !== "" ? validator.name : validator.address
        const isBootstrap = state.prohibitedNodes.includes(validatorName)
        return {
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
          Weight,            
          _cellVariants:  {
            Status: validator.active ? 'active' : 'inactive',
            Name:  isBootstrap ? "danger" : undefined
          },
        }
      }).sort(dynamicSort("Weight"))
    },
  },  
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
    async setWeb3(state, payload) {
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
    setNextElectionTime(state, millis) {
      state.nextElectionTime = millis
    },
    setWalletType(state, payload) {
      state.walletType = payload
      sessionStorage.setItem("walletType", payload)
      sessionStorage.setItem("selectedLedgerPath", null)      
    },
    setSelectedAccount(state, payload) {
      state.selectedAccount = payload
    },
    setLatesBlockNumber(state, payload) {
      state.latestBlockNumber = payload
      sessionStorage.setItem("latestBlockNumber", JSON.stringify(payload))
    },
    setCachedEvents(state, payload) {
      state.cachedGatewayEvents = payload
      sessionStorage.setItem("cachedEvents", JSON.stringify(payload))

    },
    setSelectedLedgerPath(state, payload) {
      state.selectedLedgerPath = payload
      sessionStorage.removeItem("selectedLedgerPath")
    },
    setGatewayBusy(state, busy) {
      state.gatewayBusy = busy
    },
    setHistoryPromise(state, payload) {
      state.historyPromise = payload
    },
    setDappChainEvents(state, payload) {
      state.dappChainEvents = payload
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
          commit("setSignWalletModal", false)
        } catch(err) {
          console.log("add mapping async error", err);
          commit("setSignWalletModal", false)
          if (err.message.includes("identity mapping already exists")) {
            commit("setAlreadyMappedModal", true)
          } else {
            commit("setErrorMsg", {msg: err.message, forever: false, report: true, cause: err}, { root: true })
          }
        }
      } else if((state.status == 'no_mapping' && state.mappingError !== undefined)) {
        commit("setSignWalletModal", false)
        if (err.message.includes("identity mapping already exists")) {
          commit("setAlreadyMappedModal", true)
        } else {
          commit("setErrorMsg", {msg: err.message, forever: false, report: true, cause: err}, { root: true })
        }
      } else if (state.status == 'mapped') {
        commit("setMappingSuccess", true)
      } 
      commit("setShowLoadingSpinner", false)
    },
    async storePrivateKeyFromSeed({ commit }, payload) {
      const privateKey = CryptoUtils.generatePrivateKeyFromSeed(payload.seed.slice(0, 32))
      const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
      sessionStorage.setItem('privatekey', privateKeyString)
      commit('setIsLoggedIn', true)
    },
    async clearPrivateKey({ commit }, payload) {
      sessionStorage.removeItem('privatekey')
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
        if(state.selectedLedgerPath) {
          let web3js = await initWeb3SelectedWallet(state.selectedLedgerPath)
          commit("setWeb3", web3js)
        } else {
          console.error("no HD path selected")
          throw new Error("No HD path selected")
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
    /**
     * @deprecated use get state.DappChain.validators which is automatically refreshed
     * when needed
     * @param {*} param0 
     */
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
    async listDelegatorDelegations({ state, rootState }) {
      const dposUser = rootState.DappChain.dposUser
      console.assert(!!dposUser, "expected dposUser to be initialised")
      const { amount, weightedAmount, delegationsArray } = await dposUser.listDelegatorDelegations()
      state.delegations = delegationsArray
        .filter( d => !(d.amount.isZero() && d.updateAmount.isZero()))
        // add string address to make it easy to compare
        .map( d => Object.assign(d, {
          validatorStr:d.validator.local.toString(),
        }))
      return state.delegations
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
    // this can be moved out as is automatically called once dposUser is set
    // actually instead of depending on dposUser we should depend on dpos contract
    // (if we want to display timer in "anonymous" session)
    async getTimeUntilElectionsAsync({ rootState, dispatch, commit }) {
      
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const user = rootState.DappChain.dposUser

      try {
        const result = await user.getTimeUntilElectionsAsync()
        debug("next election in %s seconds", result.toString())
        commit("setTimeUntilElectionCycle", result.toString())
        commit("setNextElectionTime", Date.now() + (result.toNumber()*1000))
      } catch(err) {
        console.error(err)
      }

    },

    async redelegateAsync({ rootState, dispatch, commit }, payload) {
      if(!rootState.DappChain.dposUser) {
        await dispatch("DappChain/initDposUser", null, { root: true })
      }

      const { origin, target, amount} = payload
      const user = rootState.DappChain.dposUser

      try {
        await user.redelegateAsync(origin, target, amount)
        commit("setSuccessMsg", {msg: "Success redelegating stake", forever: false}, {root: true})
      } catch(err) {
        console.error(err)
        commit("setErrorMsg", {msg: "Failed to redelegate stake", forever: false,report:true,cause:err}, {root: true})
      }

    },

    async fetchDappChainEvents({ state, commit, dispatch }, payload) {

      let historyPromise = axios.get(`${state.dappChainEventUrl}/eth:${state.currentMetamaskAddress}`)
      // Store the unresolved promise
      commit("setHistoryPromise", historyPromise)
      
      historyPromise.then((response) => {

        return response.data.txs.filter((tx) => {

          // Filter based on these events
          if(tx.topic === "event:WithdrawLoomCoin" ||
             tx.topic === "event:MainnetDepositEvent" ||
             tx.topic === "event:MainnetWithdrawalEvent") { return tx }
    
        }).map((tx) => {
          let type = ""
          switch(tx.topic) {
            case "event:MainnetDepositEvent":
              type = "Deposit"
              break
            case "event:MainnetWithdrawalEvent":
              type = "Withdraw"
              break
            case "event:WithdrawLoomCoin":
              type = "Withdraw Begun"
              break
            default:
              break
          } 
  
          let amount = tx.token_amount

          // Return events in this format
          return {
            "Block #" : tx.block_height,
            "Event"   : type,
            "Amount"  : formatToCrypto(amount),
            "Tx Hash" : tx.tx_hash
          }
        })
      })
      .catch((err) => {
        console.error(err)
      })
      .then((results) => {
        commit("setDappChainEvents", results)
      })

    },

    async loadEthereumHistory({commit, getters, state}, {web3, gatewayInstance, address}) {
      debug("loading history")
      const cachedEvents = getters.getCachedEvents
      // Get latest mined block from Ethereum
      const toBlock = await web3.eth.getBlockNumber()
      const fromBlock = toBlock - 7000

      const eventsToNames = {
        ERC20Received: "Deposit",
        TokenWithdrawn: "Withdraw"
      }
      debug("loading history block range ",fromBlock, toBlock  )

      // Fetch latest events
      state.history = gatewayInstance.getPastEvents("allEvents", { fromBlock, toBlock })
      .then((events) => {
        debug("got %s events", events.length)
        // Filter based on event type and user address
        let results = events.filter((event) => {
          return event.returnValues.from === address ||
                  event.returnValues.owner === address        
        })
        .map((event) => {
          let type = eventsToNames[event.event] ||  "Other"
          let amount = event.returnValues.amount || event.returnValues.value || 0 
          return {
            "Block #" : event.blockNumber,
            "Event"   : type,
            "Amount"  : formatToCrypto(amount),
            "Tx Hash" : event.transactionHash
            }
        })

        // Combine cached events with new events
        const mergedEvents = cachedEvents.concat(results)
        debug('merged events', mergedEvents.length)
          
        // Store results
        commit("setLatesBlockNumber", toBlock)
        commit("setCachedEvents", mergedEvents)

        // Display trades in the UI
        return mergedEvents
      })
      .catch(e => {
        console.error("error loading eth history", e)
        throw e
      })
    },

    async updateDailyWithdrawLimit({state}, history) {
      // TODO externalise this
      const limit = history
        .filter(item => item.Event === "Withdraw") // and date is today
        .reduce(
          (left, item) => left - parseInt(item.Amount,10), 
          DAILY_WITHDRAW_LIMIT
        )
      state.withdrawLimit =  Math.max(0, limit)
      debug('state.withdrawLimit', state.withdrawLimit)
      return state.withdrawLimit
    }

  },

}
