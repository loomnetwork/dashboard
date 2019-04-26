/* eslint-disable */
import {
  CryptoUtils, Client, LocalAddress, Contracts, Address, createJSONRPCClient, NonceTxMiddleware,
  SignedTxMiddleware, SignedEthTxMiddleware, DPOSUserV3,
} from 'loom-js'

import { createDefaultClient } from 'loom-js/dist/helpers'

import networks from '../../chain-config'
import { getMetamaskSigner, EthersSigner } from "loom-js/dist/solidity-helpers"
import { getDomainType, formatToCrypto } from '../utils'
import GatewayJSON from '../contracts/Gateway.json'
import Debug from "debug"

Debug.enable("dashboard.dapp")
const debug = Debug("dashboard.dapp")

import BN from 'bn.js'

const DPOS2 = Contracts.DPOS2
let LOOM_ADDRESS = ""
let GW_ADDRESS = ""

const hostname = window.location.hostname 
if (hostname === "dashboard.dappchains.com") {
  LOOM_ADDRESS = ""
  GW_ADDRESS = ""
} else if ( hostname === "dev-dashboard.dappchains.com") {
  LOOM_ADDRESS = "0x165245382ff23A5D3782b48286B6A81b6fd0508e"
  GW_ADDRESS = "0x76c41eFFc2871e73F42b2EAe5eaf8Efe50bDBF73"
} else {
  LOOM_ADDRESS = ""
  GW_ADDRESS = ""
}

const getNetworkId = (chainUrls) => {
  let networkId = sessionStorage.getItem('networkId')
  let defaultId = Object.keys(networks)[0]
  return networkId || defaultId
}

const getCurrentChain = (chainUrls) => {
  let networkId = sessionStorage.getItem('networkId')
  let defaultId = Object.keys(networks)[0]
  return chainUrls[networkId] || chainUrls[defaultId]
}

const getServerUrl = (chain) => {
  const url = chain.websockt || chain.rpc
  const splited = url.split('://')
  if (splited[1]) {
    return splited[1].split('/')[0]
  }
  return ''
}

const createClient = (state, privateKeyString) => {

  const networkConfig = state.chainUrls[state.networkId]
    
  const { client, publicKey, address } = createDefaultClient(privateKeyString, networkConfig["dappchainEndpoint"], networkConfig["chainId"])
  client.on('error', msg => {
    commit('setDappChainConnected', false)
    console.error('PlasmaChain connection error', msg)
  })

  return client

}

/**
 * overrides client.middleware SignedEthTxMiddleware.Handle
 * to notify vuex when the user has to sign
 * @param {*} user 
 * @param {*} _client 
 * @param {*} commit 
 */
function reconfigureClient(client, commit) {
  const middleware = client.txMiddleware.find((m) => m instanceof SignedEthTxMiddleware)
  if (!middleware) {
    console.warn("could not find SignedEthTxMiddleware in client.middleware for reconfiguration")
    return client
  }
  const handle = middleware.Handle.bind(middleware)
  middleware.Handle = async function (txData) {
    commit('setShowSigningAlert', true)
    const res = await handle(txData)
    commit('setShowSigningAlert', false)
    return res
  }
  return client
}


const defaultState = () => {

  return {
    web3: undefined,
    account: undefined,
    accountStakesTotal: null,
    localAddress: undefined,
    count: 0,
    chainUrls: networks,
    networkId: getNetworkId(networks),
    currentChain: getCurrentChain(networks),
    dAppChainClient: undefined,
    GatewayInstance: undefined,
    dposUser: undefined,
    dpos3: undefined,
    mappingStatus: undefined,
    mappingError: undefined,
    metamaskStatus: undefined,
    metamaskError: undefined,
    isConnectedToDappChain: false,
    showSigningAlert: false,
    validators: [],
  }
}

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getAccount(state) {
      return state.account
    },
    currentChain(state) {
      return state.chainUrls[state.networkId]
      const endpoint = network["dappchainEndpoint"]
      const wsUri = `${endpoint.replace(/http|https/g, "wss")}/websocket`
      return wsUri
    },
    currentRPCUrl(state) {
      const network = state.chainUrls[state.networkId]
      const url = new URL(network.websockt || network.rpc)
      url.protocol =  url.protocol.replace(/:/g, "") === "wss" ? "https" : "http"
      url.pathname = "rpc"
      return url.toString()
      // if (network.rpc) return network.rpc
      // if (network.websockt) {
      //   const splited = network.websockt.split('://')
      //   if (splited[1]) {
      //     return 'https://' + splited[1].split('/')[0] + '/rpc'
      //   }
      // }
      // return ''
    }
  },
  mutations: {
    updateState(state, payload) {
      state.account = payload.account
      state.dAppChainClient = payload.dAppChainClient
      state.localAddress = payload.localAddress
    },
    setWeb3(state, payload) {
      state.web3 = payload
    },
    setMappingStatus(state, payload) {
      state.mappingStatus = payload
    },
    setMappingError(state, payload) {
      state.mappingError = payload
    },
    setMetamaskStatus(state, payload) {
      state.metamaskStatus = payload
    },
    setMetamaskError(state, payload) {
      state.metamaskError = payload
    },
    setDappChainConnected(state, payload) {
      state.isConnectedToDappChain = payload
    },
    setWithdrewSignature(state, payload) {
      if(!payload) {
        sessionStorage.removeItem('withdrewSignature');
      } else {
        sessionStorage.setItem('withdrewSignature', payload)
      }
    },
    setDPOSUserV3(state, payload) {
      console.log("setting dpos user")
      state.dposUser = payload
    },
    setShowSigningAlert(state, payload) {
      state.showSigningAlert = payload
    },
    setValidators(state, payload) {
      state.validators = payload
    },
    setNetworkId(state, payload) {
      state.networkId = payload
      sessionStorage.setItem('networkId', payload)
    },
    setCurrentChain(state, payload) {
      state.currentChain = payload
    }
  },
  actions: {
    addChainUrl({ state, dispatch, commit }, payload) {
      if(state.networkId === payload.id) return
      const chains = Object.keys(state.chainUrls)
      const existingId = chains.indexOf(payload.id)    
      if(existingId > -1) {
        commit("setNetworkId", payload.id)
        commit("setCurrentChain", state.chainUrls[payload.id])
      } else {
        return
      }
    },
    registerWeb3({ commit, state, getters }, payload) {
      try {
        commit('setWeb3', payload.web3)
        // these are filled on yarn serve/build
        state.GatewayInstance = new payload.web3.eth.Contract(GatewayJSON.abi, GW_ADDRESS || state.currentChain["gatewayAddress"])
      } catch (err) {
        console.error(err)
      }
    },
    async getMetamaskLoomBalance({ state , commit}) {
      if (!state.web3) return 0

      if (!state.dposUser) {
        throw new Error("Expected dposUser to be initialized")
      }
      const dposUser = await state.dposUser
      const web3js = state.web3
      try {
        let result = await state.dposUser.ethereumLoom.balanceOf(address)
        let balance = web3js.utils.fromWei(result.toString())
        let limitDecimals = parseFloat(balance).toFixed(2)
        return limitDecimals
      } catch (err) {
        commit('setErrorMsg', {msg: "Error getting metamask balance", forever: false, report:true, cause:err}, {root: true})
        return 0
      }
    },
    async initDposUser({ state, rootState, getters, dispatch, commit }) {
      console.log("initdpos user")
      if (!rootState.DPOS.web3) {    
        await dispatch("DPOS/initWeb3Local", null, { root: true })
      }
      const network = state.chainUrls[state.chainIndex].network
      // set state dposUser to be a Promise<dposUser> so that components caalling it don't complain or go and try to init another dpos user...
      const user = DPOSUserV3.createEthSignMetamaskUserAsync({
        web3: rootState.DPOS.web3,
        dappchainEndpoint: getters.dappchainEndpoint,
        chainId: network,
        gatewayAddress: GW_ADDRESS || state.currentChain["gatewayAddress"],
        version: 2
      })
      .then(user => {
        reconfigureClient(user._client, commit)
        console.log('dposUser ready')
        return user
      })
      .catch((err) => {
        console.log(err)
        commit('setErrorMsg', {msg: "Error initDposUser", forever: false, report:true, cause:err}, {root: true}) 
        return null
      })
      // set the promise
      commit("setDPOSUserV3", user)
    },
    // TODO: this is added to fix mismatched account mapping issues, remove once all users are fixed.
    async switchDposUser({ state, rootState, getters, dispatch, commit }, payload) {
      const privateKeyString = sessionStorage.getItem('privatekey')
      if (!privateKeyString) {
        // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
        throw new Error('No Private Key, Login again')
      }
      const network = state.networkId
      let user

      let dposConstructor

      if (['dev', 'local'].includes(getDomainType())) {
        dposConstructor = DPOSUser.createEthSignMetamaskUserAsync
      } else {
        dposConstructor = DPOSUser.createMetamaskUserAsync
      }

      let user
      try {
        if (['dev', 'local'].includes(getDomainType())) {
          user = await DPOSUserV3.createEthSignMetamaskUserAsync({
            web3: payload.web3,
            dappchainEndpoint: getters.dappchainEndpoint,
            chainId: network,
            gatewayAddress: GW_ADDRESS || GatewayJSON.networks[network].address,
            version: 2
          });
        } else {
          user = await DPOSUserV3.createMetamaskUserAsync({
            web3: payload.web3,
            dappchainEndpoint: getters.dappchainEndpoint,
            dappchainPrivateKey: privateKeyString,
            chainId: network,
            gatewayAddress: GW_ADDRESS || state.currentChain["gatewayAddress"],
            version: 2
          });
        }
      } catch(err) {
        commit('setErrorMsg', {msg: "Error initDposUser", forever: false, report:true, cause:err}, {root: true})
      }
      state.dposUser = user
    },
    /**
     * 
     * @param {store} param0 
     * @param {{amount}} payload 
     * @returns {Promise<TransactionReceipt>}
     */
    async depositAsync({ state }, {amount}) {
      console.assert(state.dposUser, "Expected dposUser to be initialized")
      commit('DPOS/setGatewayBusy', true, { root: true })
      const user = await state.dposUser
      const tokens = new BN( "" + parseInt(amount,10)) 
      const weiAmount = new BN(state.web3.utils.toWei(tokens, 'ether'), 10)
      const res = user.depositAsync(new BN(weiAmount, 10))
      commit('DPOS/setGatewayBusy', false, { root: true })
      return res
    },
    /**
     * 
     * @param {store} param0 
     * @param {{amount}} payload 
     * @returns {Promise<TransactionReceipt>}
     */
    async withdrawAsync({ state, commit }, {amount}) {
      console.assert(state.dposUser, "Expected dposUser to be initialized")
      const user = await state.dposUser
      const tokens = new BN( "" + parseInt(amount,10)) 
      const weiAmount = new BN(state.web3.utils.toWei(tokens, 'ether'), 10)
      commit('DPOS/setGatewayBusy', true, { root: true })
      console.log("withdrawAsync",weiAmount)
      let res = await user.withdrawAsync(new BN(weiAmount, 10))
      commit('DPOS/setGatewayBusy', false, { root: true })
      return res
    },
    async approveAsync({ state, dispatch }, payload) {
      commit('DPOS/setGatewayBusy', true, { root: true })

      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }

      const { amount } = payload
      const user = await state.dposUser
      
      const token = user.ethereumLoom
      const gateway = user.ethereumGateway
      await token.approve(gateway.address, amount)
      
    },
    async getDappchainLoomBalance({ rootState, state, dispatch }) {
      if (!state.dposUser) {
        throw new Error("Expected dposUser to be initialized")
      }
      const user = await state.dposUser
      let loomWei = await user.getDAppChainBalanceAsync()
      console.log("loom onplasma",loomWei.toString())
      const balance = state.web3.utils.fromWei(loomWei.toString(), 'ether')
      let limitDecimals = parseFloat(balance).toFixed(2)
      return limitDecimals
    },
    async delegateAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }  
      const user = await state.dposUser    
      try {       
        let weiAmount = state.web3.utils.toWei(payload.amount, 'ether') 
        let tier = parseInt(payload.tier)
        await user.delegateAsync(payload.candidate, new BN(weiAmount, 10), tier)
        commit('setSuccessMsg', {msg: `Success delegating ${payload.amount} tokens`, forever: false}, {root: true})
      } catch(err) {
        commit('setErrorMsg', {msg: "Error delegating", forever: false, report:true, cause:err}, {root: true})
      }      
    },
    async undelegateAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }
      const user = await state.dposUser    
      let weiAmount = state.web3.utils.toWei(payload.amount, 'ether')    
      let loomAmount = weiAmount / 10 ** 18
      try {
        const result = await user.undelegateAsync(payload.candidate, new BN(weiAmount,10))
        commit('setSuccessMsg', {msg: `Success un-delegating ${loomAmount} tokens`, forever: false}, {root: true})
      } catch(err) {
        commit('setErrorMsg', {msg: "Failed to undelegate", forever: false, report:true, cause:err}, {root: true})
      }
    }, 
    async getValidatorsAsync({ dispatch, commit, rootState }) {
      const dpos3 = await dispatch('getDpos3')
      const template = {
          address:  "",
          pubKey: "",
          active : false,
          isBootstrap : false,
          totalStaked: "0",
          personalStake: "0",
          votingPower: "0",
          delegationTotal: "0",
          delegatedStake: "0",
          name: "",
          website: "",
          description: "",
          fee: "N/A",
          newFee: "N/A",
      }
      // Get all validators, candidates and delegations
      const [validators,candidates,delegations] = await Promise.all([
        dpos3.getValidatorsAsync(),
        dpos3.getCandidatesAsync(),
        dpos3.getAllDelegations()
      ])
      const nodes = candidates.map((c) => 
        Object.assign({}, template, {
          address:  c.address.local.toString(),
          pubKey: CryptoUtils.Uint8ArrayToB64(c.pubKey),
          personalStake: c.whitelistAmount.toString(),
          votingPower: c.delegationTotal.toString(),
          delegationsTotal: c.delegationTotal.sub(c.whitelistAmount).toString(),
          active : false,
          isBootstrap: rootState.DPOS.prohibitedNodes.includes(c.name),
          name: c.name,
          website: c.website,
          description: c.description,
          fee: (c.fee / 100).toString(),
          newFee: (c.newFee / 100).toString()
        })
      )
      // helper
      const getOrCreate = (addr) => {
        let existing = nodes.find((node) => node.address === addr)
        if (!existing) {
          existing = Object.assign({},template, {address: addr})
          nodes.push(existing)
        }
        return existing
      }

      validators.forEach((v) => {
        const addr = v.address.local.toString()
        const node = getOrCreate(addr)
        Object.assign(node, {
            active:  true,
            personalStake: v.whitelistAmount.toString(),
            totalStaked: v.whitelistAmount.toString(), //default value for nodes without delegations
            votingPower: v.delegationTotal.toString(),
            delegationsTotal: v.delegationTotal.sub(v.whitelistAmount).toString()
        })
      })

      delegations.filter((d) => d.delegationsArray.length > 0)
      .forEach((d) => {
        const addr = d.delegationsArray[0].validator.local.toString()
        const delegatedStake = d.delegationTotal
        const node = getOrCreate(addr)
        Object.assign(node, {
          delegatedStake: delegatedStake.toString(),
          totalStaked: new BN(node.personalStake).add(delegatedStake).toString(),
        })
      })
      console.log(nodes)
      // use the address for those without names 
      nodes.filter((n) => n.name === "").forEach(n => n.name = n.address)
      commit("setValidators", nodes)
    },
    async getAccumulatedStakingAmount({ state, dispatch }, payload) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }      
      const totalDelegation = await state.dposUser.getTotalDelegationAsync()
      const amount = formatToCrypto(totalDelegation.amount)
      state.accountStakesTotal = totalDelegation.amount
      return amount
    },
    async checkDelegationAsync({ state, dispatch}, payload) {
      const privateKeyString = sessionStorage.getItem('privatekey')
      if (!privateKeyString) {
        // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
        throw new Error('No Private Key, Login again')
      }

      const dpos3 = await dispatch('getDpos3', {
        privateKey: privateKeyString
      })
      const privateKey = CryptoUtils.B64ToUint8Array(privateKeyString)
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      const chainId = state.networkId
      const result = dpos2.checkDelegationAsync(
        new Address(chainId, LocalAddress.fromPublicKey(CryptoUtils.B64ToUint8Array(payload.validator))),
        new Address(chainId, LocalAddress.fromPublicKey(publicKey)))
      return result
    },
    async getDpos3({ state, commit }, payload) {
      if (!payload && state.dpos3) {
        commit('setDappChainConnected', true)
        return state.dpos3
      }

      const networkConfig = state.chainUrls[state.networkId]
    
      let privateKey
      if (payload && payload.privateKey) {
        privateKey = CryptoUtils.B64ToUint8Array(payload.privateKey)
      } else {
        privateKey = CryptoUtils.generatePrivateKey()
      }

      let privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)

      const { client, publicKey, address } = createDefaultClient(privateKeyString, networkConfig["dappchainEndpoint"], networkConfig["chainId"])
      client.on('error', msg => {
        commit('setDappChainConnected', false)
        console.error('PlasmaChain connection error', msg)
      })

      const dpos3 = await DPOS3.createAsync(client, new Address(networkId, LocalAddress.fromPublicKey(publicKey)))
      state.dpos3 = dpos3
      commit('setDappChainConnected', true)
      return dpos3
    },
    async ensureIdentityMappingExists({ rootState, state, dispatch, commit, rootGetters }, payload) {

      let metamaskAddress = ""
      if(payload) {
        metamaskAddress = payload.currentAddress.toLowerCase()
      } else {
        metamaskAddress = rootState.DPOS.currentMetamaskAddress.toLowerCase()
      }

      const client = createClient(state, rootState.DPOS.dashboardPrivateKey)
      commit("DPOS/setClient", client, { root: true })

      const contractAddr = await client.getContractAddressAsync('addressmapper')

      const dappchainAddress = rootGetters["DPOS/getDashboardAddressAsLocalAddress"]

      try {
        commit("DPOS/setStatus", "check_mapping", {root: true})
        commit('setMappingError', null)
        commit('setMappingStatus', null)
        
        let dashboardAddress = new Address("default", LocalAddress.fromHexString(rootState.DPOS.dashboardAddress))
        let addressMapper = await Contracts.AddressMapper.createAsync(client, dashboardAddress)
        commit("DPOS/setMapper", addressMapper, { root: true })
        let address = new Address("eth", LocalAddress.fromHexString(metamaskAddress))
        const mapping = await addressMapper.getMappingAsync(address)
        const mappedEthAddress = mapping.to.local.toString()

      } catch (err) {
        commit("DPOS/setStatus", "no_mapping", {root: true})
        console.error("Error ensuring mapping exists: ", err)
        // commit('setErrorMsg', {msg: `Error mapping identities, please try again`, forever: true}, {root: true})
        return
      }
      commit("DPOS/setStatus", "mapped", {root: true})
    },
    async createNewPlasmaUser({ state, rootState, dispatch }) {
      const privateKey = CryptoUtils.generatePrivateKey()
      const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      const address = LocalAddress.fromPublicKey(publicKey)
      const ethAddr = rootState.DPOS.currentMetamaskAddress.toLowerCase()
      const wallet = getMetamaskSigner(rootState.DPOS.web3.currentProvider)
      const signer = new EthersSigner(wallet)

      let one = new Address("default", address)
      let two = new Address("eth", LocalAddress.fromHexString(ethAddr)) 
      const client = createClient(state, privateKeyString)
      let addressMapper = await Contracts.AddressMapper.createAsync(client, one)
      await addressMapper.addIdentityMappingAsync(
        one,
        two,
        signer 
      )
    },
    async addMappingAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      } try {
        await state.dposUser.mapAccountsAsync()
        commit("DPOS/setStatus", "mapped", {root: true})
      } catch (err) {
        commit('setMappingError', err.message)
        throw Error(err.message.toString())
      }
    },
    async getUnclaimedLoomTokens({ state, dispatch, commit } ) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }
      
      const user = await state.dposUser

      const web3js = state.web3
      const accounts = await web3js.eth.getAccounts()
      if (accounts.length === 0) return 0
      const address = accounts[0]
      const formattedAddress = `eth:${address}`
      console.log('formatted address:', formattedAddress)
      try {
        let unclaimAmount = await user.getUnclaimedLoomTokensAsync(address)
        console.log('unclaimed amount', unclaimAmount)
        return unclaimAmount
      } catch (err) {
        console.log("Error check unclaim loom tokens", err);
        commit('setErrorMsg', 'Error check unclaim loom tokens', { root: true, cause:err})
      }
    },
    async reclaimDeposit({ state, dispatch, commit } ) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }
      commit('DPOS/setGatewayBusy', true, { root: true })
      const user = await state.dposUser
      const dappchainGateway = user.dappchainGateway
      try {
        await dappchainGateway.reclaimDepositorTokensAsync()
      } catch (err) {
        console.log("Error reclaiming tokens", err);
        commit('setErrorMsg', 'Error reclaiming tokens', { root: true, cause:err})
      }
      commit('DPOS/setGatewayBusy', false, { root: true })
    },

    async getPendingWithdrawalReceipt({ state, dispatch, commit } ) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }
      const user = await state.dposUser
      try {
        const receipt = await user.getPendingWithdrawalReceiptAsync()
        if(!receipt) return null
        const signature = CryptoUtils.bytesToHexAddr(receipt.oracleSignature)
        const owner = CryptoUtils.bytesToHexAddr(receipt.tokenOwner.local.bytes)
        const amount = receipt.tokenAmount
        return  { signature: signature, amount: amount, tokenOwner: owner }
      } catch (err) {
        console.log("Error get pending withdrawal receipt", err);
        commit('setErrorMsg', 'Error get pending withdrawal receipt', { root: true, cause:err})       
      }
    },

    async withdrawCoinGatewayAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        throw new Error("expected dposUser to be initialized")
      }

      var user = await state.dposUser
      commit('DPOS/setGatewayBusy', true, { root: true })
      try {
        const result = await user.withdrawCoinFromRinkebyGatewayAsync(payload.amount, payload.signature)
        console.log("result", result);
        commit('DPOS/setGatewayBusy', false, { root: true })
        return  result
      } catch (err) {
        console.log("Error withdrawal coin from gateway", err);
        throw Error(err.message)       
      }
    },
    async init({ state, commit, rootState }, payload) {

      let privateKey
      let privateKeyString = sessionStorage.getItem('privatekey')

      if (!privateKeyString) {
        // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
        return
      }

      privateKey = CryptoUtils.B64ToUint8Array(privateKeyString)
      let account

      const networkConfig = state.chainUrls[state.networkId]

      let publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      let client
      if (networkConfig.websockt) {
        client = new Client(networkConfig.network, networkConfig.websockt, networkConfig.queryws)
      } else {
        client = new Client(networkConfig.network,
          createJSONRPCClient({
            protocols: [{ url: networkConfig.rpc }]
          }),
          networkConfig.queryws
        )
      }
      client.txMiddleware = [
        new NonceTxMiddleware(publicKey, client),
        new SignedTxMiddleware(privateKey)
      ]

      account = LocalAddress.fromPublicKey(publicKey).toString()
      let localAddress = new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))

      commit('updateState', {
        account,
        localAddress,
        dAppChainClient: client,
      })
    },
    showMsg({ commit }, payload) {
      const msgType = payload.type === "error" ? "setErrorMsg" : "setSuccessMsg";
      commit(msgType, payload.msg, { root: true })
    }
  }
}
