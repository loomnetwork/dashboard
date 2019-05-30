import axios from 'axios'
const { CryptoUtils, LocalAddress } = require('loom-js')
import { formatToCrypto } from '../utils'
import { initWeb3 } from '../services/initWeb3'

import {ethers} from "ethers"

import Debug from "debug"
import { Store, ActionTree, GetterTree, Module } from 'vuex';
import { DPOS3 } from 'loom-js/dist/contracts';
import { DPOSUserV3, Address } from 'loom-js';
import BN from "bn.js"
import { DashboardState } from '@/types';
import { Log } from 'ethers/providers';

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
      isLoading: false,
      loomBalance: null,
      mainnetBalance: null,
      stakedAmount: null
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
    prohibitedNodes: ["plasma-0", "plasma-1", "plasma-2", "plasma-3", "plasma-4", "plasma-5", "Validator #4", "test-z-us1-dappchains-2-aws0"],
    latestBlockNumber: null,
    cachedEvents: [],
    dappChainEventUrl: "//dev-api.loom.games/plasma/address",
    historyPromise: null,
    dappChainEvents: [],
    states: ["Bonding", "Bonded", "Unbounding", "Redelegating"],
    delegations: [],
    dashboardPrivateKey: "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
    dashboardAddress: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
    analyticsEndpoint: "//dev-api.loom.games",
    client: null,
    mapper: null,
    analyticsData: null,
    showDepositForm: false,
    showDepositApproved: false,
    showDepositConfirmed: false,
    pendingTx: null,
    electionIsRunning: false,
  }
}

/* eslint-disable */
export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getLatestBlockNumber(state) {
      return state.latestBlockNumber || JSON.parse(sessionStorage.getItem("latestBlockNumber")|| "")
    },
    getCachedEvents(state) {
      return state.cachedEvents || JSON.parse(sessionStorage.getItem("cachedEvents") || "[]")
    },
    getDashboardAddressAsLocalAddress(state) {
      return LocalAddress.fromHexString(state.dashboardAddress)
    },
    getFormattedValidators(state,getters,rootState) {

      return rootState.DappChain.validators.map((validator) => {
        let Weight = 0
        if ( validator.name.startsWith("plasma-") )  {
          Weight = 1
        } else if( validator.name === "" ) {
          Weight = 2
        }
        const validatorName = validator.name !== "" ? validator.name : validator.address
        const isBootstrap = validator.isBootstrap
        return {
          Address: validator.address,
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
  } as GetterTree<any,any>,  
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
      sessionStorage.removeItem("selectedLedgerPath")      
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
    },
    setClient(state, payload) {
      state.client = payload
    },
    setMapper(state, payload) {
      state.mapper = payload
    },
    setAnalyticsData(state, payload) {
      state.analyticsData = payload
    },
    setDelegations(state, payload) {
      state.delegations = payload
    },
    setShowDepositForm(state, payload) {
      state.showDepositForm = payload
    },
    setShowDepositApproved(state, payload) {
      state.showDepositApproved = payload
    },
    setShowDepositConfirmed(state, payload) {
      state.showDepositConfirmed = payload
    },
    setPendingTx(state, info) {
      state.pendingTx = info
    },
    setElectionIsRunning(state, payload) {
      state.electionIsRunning = payload
    }
  },
  actions: {
    async initializeDependencies({ state, commit, dispatch }, payload) {
      commit("setShowLoadingSpinner", true)
      try {
        await dispatch("initWeb3Local")
        await dispatch("DappChain/ensureIdentityMappingExists", null, { root: true })
        await dispatch("checkMappingAccountStatus")
        await dispatch("DappChain/initDposUser", null, { root: true })

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
          await dispatch("DappChain/createNewPlasmaUser", null, { root: true })
          // await dispatch("DappChain/addMappingAsync", null, { root: true })
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
        // if (err.message.includes("identity mapping already exists")) {
        //   commit("setAlreadyMappedModal", true)
        // } else {
        //   commit("setErrorMsg", {msg: err.message, forever: false, report: true, cause: err}, { root: true })
        // }
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
    // broken
    async initWeb3Local({commit, state, dispatch}){
      if(state.walletType === "metamask") {
        let web3js = await initWeb3()
        let accounts = await web3js.eth.getAccounts()
        let metamaskAccount = accounts[0]
        commit("setWeb3", web3js)
        commit("setCurrentMetamaskAddress", metamaskAccount)
      } else if(state.walletType === "ledger") {
        if(state.selectedLedgerPath) {
          // let web3js = await initWeb3SelectedWallet(state.selectedLedgerPath)
          // commit("setWeb3", web3js)
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
      // @ts-ignore
      if (window.ethereum) {
        // @ts-ignore
        window.web3 = new Web3(ethereum)
                // @ts-ignore
        web3js = new Web3(ethereum)
        try {
          // @ts-ignore
          await ethereum.enable();
        } catch (err) {
          dispatch("setError", "User denied access to Metamask", {root: true})
          return
        }
      // @ts-ignore
      } else if (window.web3) {
        // @ts-ignore
        window.web3 = new Web3(window.web3.currentProvider)
        // @ts-ignore
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
        const validatorList:any[] = []
        for (let i in validators) {
          const validator = validators[i]

          let weight = 0
          if ( validator.isBootstrap )  {
            weight = 1
          } else if( validator.name === "" ) {
            weight = 2
          }


          // Check if bootstrap val
          const validatorName = validator.name !== "" ? validator.name : validator.address
          const isBootstrap = validator.isBootstrap
          validatorList.push({
            Address: validator.address,
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
    async checkAllDelegations({ state, rootState, commit }) {
      const dposUser:DPOSUserV3 = await rootState.DappChain.dposUser
      console.assert(!!dposUser, "expected dposUser to be initialised")
      debug("checkAllDelegationsAsync")
      const { amount, weightedAmount, delegationsArray } = await dposUser.checkAllDelegationsAsync()
      debug("delegations",delegationsArray)
      let filteredDelegations = delegationsArray
        // delegation with index 0 represents rewards
        .filter((d) => d.index > 0)
        .filter( d => !(d.amount.isZero() && d.updateAmount.isZero()))
        // add string address to make it easy to compare
        .map( d => Object.assign(d, {
          validatorStr:d.validator.local.toString(),
        }))
      const userBalance = state.userBalance
      const stakedAmount = formatToCrypto(weightedAmount.toString())
      commit("setDelegations", filteredDelegations)
      commit("setUserBalance", Object.assign(userBalance,{stakedAmount}))
    },
    async consolidateDelegations( {rootState}, validator) {
      const dposUser:DPOSUserV3 = await rootState.DappChain.dposUser
      console.assert(!!dposUser, "expected dposUser to be initialised")
      const address = Address.fromString(`${dposUser.client.chainId}:${validator.address}`)
      debug("consolidateDelegations")
      await dposUser.dappchainDPOS.consolidateDelegations(address)
    },
    async queryRewards({ rootState, commit }) {
      if (!rootState.DappChain.dposUser) {
        throw new Error("Expected dposUser to be initialized")
      }

      const user:DPOSUserV3 = await rootState.DappChain.dposUser
      
      try {
        debug("queryRewards")
        const result = await user.checkDelegatorRewardsAsync()
        const formattedResult = formatToCrypto(result)
        commit("setRewardsResults", formattedResult)
      } catch(err) {
        if(err.message.includes("Distribution record not found")) { 
          commit("setRewardsResults", 0)
         } else {
          commit("setErrorMsg", {msg: "Failed querying rewards", forever: false,report:true,cause:err}, {root: true})
        }
      }
      
    },

    async claimRewardsAsync({ rootState }) {
      if (!rootState.DappChain.dposUser) {
        throw new Error("Expected dposUser to be initialized")
      }
      const user:DPOSUserV3 = await rootState.DappChain.dposUser
      try {
        debug("claimDelegatorRewardsAsync")
        const limboValidator = "0x00000000000000000000000000000000"
        const limboDelegations = await user.checkDelegationsAsync(limboValidator)
        if (limboDelegations!.delegationsArray.length > 0) {
          await user.undelegateAsync(limboValidator, 0, 0) 
        }
        await user.claimDelegatorRewardsAsync()
      } catch(err) {
        console.error(err)
      }
      
    },    
    // this can be moved out as is automatically called once dposUser is set
    // actually instead of depending on dposUser we should depend on dpos contract
    // (if we want to display timer in "anonymous" session)
    async getTimeUntilElectionsAsync({ commit, dispatch }) {  
      debug("getTimeUntilElectionsAsync")
      const dpos:DPOS3 = await dispatch("DappChain/getDpos3", null, { root: true })
      try {
        const result:BN = await dpos.getTimeUntilElectionAsync()
        debug("next election in %s seconds", result.toNumber())
        commit("setTimeUntilElectionCycle", ""+result.toNumber())
        commit("setNextElectionTime", Date.now() + (result.toNumber()*1000))//Date.now() + (result.toNumber()*1000))
      } catch(err) {
        console.error(err)
      }

    },

    async redelegateAsync({ rootState, commit }, payload) {
      if (!rootState.DappChain.dposUser) {
        throw new Error("Expected dposUser to be initialized")
      }

      const { origin, target, amount, index} = payload
      const user = await rootState.DappChain.dposUser

      try {
        await user.redelegateAsync(origin, target, amount, index)
        commit("setSuccessMsg", {msg: "Success redelegating stake", forever: false}, {root: true})
      } catch(err) {
        console.error(err)
        commit("setErrorMsg", {msg: "Failed to redelegate stake", forever: false,report:true,cause:err}, {root: true})
      }

    },

    async fetchDappChainEvents({ state, commit }) {

      let historyPromise = axios.get(`${state.dappChainEventUrl}/eth:${state.currentMetamaskAddress}?sort=-block_height`)
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

    async fetchAnalyticsData({ state, commit, dispatch }, payload) {
      // TODO: Uncomment to use .env
      // let url = process.env.VUE_APP_ANALYTICS_URL
      // let dataPromise = await axios.get(url + "/delegation/total?from_date&to_date")
      let url = state.analyticsEndpoint
      let dataPromise = await axios.get(url + "/delegation/total?from_date&to_date")
      commit("setAnalyticsData", dataPromise)

    },
    async loadEthereumHistory({commit, rootState, getters, state}) {
      debug("loadEthereumHistory")
      if (!rootState.DappChain.dposUser) {
        console.warn("no dposUser for which to call history")
        return
      }
      const user:DPOSUserV3 = await rootState.DappChain.dposUser

      const loom = user.ethereumLoom
      const gateway = user.ethereumGateway
      const provider = user.ethereumGateway.provider
      const cachedEvents = getters.getCachedEvents
      // Get latest mined block from Ethereum
      const depositFilter = loom.filters.Transfer(user.ethAddress, gateway.address,null)
      const withdrawFilter = loom.filters.Transfer(gateway.address,user.ethAddress,null)
      let deposits:Log[]
      let withdraws:Log[]
      let toBlock
      try {
         deposits = await loom.provider.getLogs(depositFilter)
         withdraws = await loom.provider.getLogs(withdrawFilter)
         toBlock = await provider.getBlockNumber()
      }
      catch(e) {
        console.error(e)
        return []
      }

      const history = deposits.map((entry) => ({
        "Block #" : entry.blockNumber!,
        "Event"   : "Deposit",
        "Amount"  : formatToCrypto(entry.topics[2]),
        "Tx Hash" : entry.transactionHash
      }))
      .concat(
        withdraws.map((entry) => ({
          "Block #" : entry.blockNumber!,
          "Event"   : "Withdraw",
          "Amount"  : formatToCrypto(entry.topics[2]),
          "Tx Hash" : entry.transactionHash
        }))
      )
      .sort((a,b) => a["Block #"] - b["Block #"])

      const mergedEvents = cachedEvents.concat(history)
      commit("setLatesBlockNumber", toBlock)
      commit("setCachedEvents", mergedEvents)
      debug("ethereum history",mergedEvents)
      return mergedEvents
      
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
    },
    /**
     * sends an approval request and does not wait for a confirmation
     * as we listen to confirmations on the contract
     * @param {*} param0 
     * @param {*} tokenAmount 
     * @see dposPlugin
     */
    async approveDeposit({rootState, commit}, tokenAmount) {
      const dposUser:DPOSUserV3 = await rootState.DappChain.dposUser
      console.assert(dposUser, "Expected dposUser to be initialized")
      const loom  = dposUser.ethereumLoom
      const gw  = dposUser.ethereumGateway
      const wei = ethers.utils.parseEther(""+tokenAmount)
      debug('approve', gw.address, wei.toString(), wei)
      return executeTx(
        commit,
        "deposit approval",
        () => loom.functions.approve( gw.address, wei.toString())
      )
    },
    /**
     * deposits amount: min(allowance, floor(ballance))
     * if amount > 0
     * todo handle error
     * 
     * @param {Store} param0 
     * @param {ethers.utils.BigNumber} weiAmount 
     */
    async executeDeposit({rootState, commit}) {
      const dposUser:DPOSUserV3 = await rootState.DappChain.dposUser
      console.assert(dposUser, "Expected dposUser to be initialized")
      const loom  = dposUser.ethereumLoom
      const gw = dposUser.ethereumGateway
      const account = dposUser.ethAddress
      const rawAmount = await Promise.all([
          loom.balanceOf(account),
          loom.allowance(account, gw.address)
        ])
        .then(([balance, allowance]) => { 
          debug("balance %s allowance %s", balance.toString(), allowance.toString())
          return allowance.lt(balance) ? allowance : balance
        })

      // rounding... 
      const amount = rawAmount.sub(rawAmount.mod(ethers.constants.WeiPerEther))
      if (amount.isZero()) {
        throw new Error('No allowance or insufisient funds')
      }
      debug("depositERC20 %s ", amount.toString(), loom.address)

      await executeTx(
        commit,
        "deposit",
        () => gw.functions.depositERC20(amount.toString(), loom.address)
      )
    },
  } as ActionTree<any,any>,

} as Module<any,DashboardState>

/**
 * 
 * @param {*} commit 
 * @param {*} type 
 * @param {*} fn 
 * @see approveDeposit
 * @see executeDeposit
 */
async function executeTx(commit,type,fn) {
  const pendingTx = {type, hash:""}; 
  commit("setGatewayBusy",true)
  try {
    const tx = await fn()
    debug('pending tx', tx.hash)
    pendingTx.hash = tx.hash

  } catch(err) {
    // imToken funky output
    if(err.transactionHash) {
      pendingTx.hash = err.transactionHash
    } else {
      commit("setGatewayBusy",false)
      throw err
    }
  }

  commit("setPendingTx", pendingTx)
  commit("setGatewayBusy",false)
}
