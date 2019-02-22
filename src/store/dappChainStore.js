/* eslint-disable */
import Web3 from 'web3'
import {
  LoomProvider, CryptoUtils, Client, LocalAddress, Contracts, Address, createJSONRPCClient, Web3Signer, NonceTxMiddleware,
  SignedTxMiddleware, DPOSUser
} from 'loom-js'
import ApiClient from '../services/api'
import { getDomainType, formatToCrypto, toBigNumber, isBigNumber, getValueOfUnit } from '../utils'
import LoomTokenJSON from '../contracts/LoomToken.json'
import GatewayJSON from '../contracts/Gateway.json'

const coinMultiplier = new BN(10).pow(new BN(18));

import BN from 'bn.js'

const api = new ApiClient()
const DPOS2 = Contracts.DPOS2

/*
network config
1: mainnet
4: rinkeby
 */
const clientNetwork = {
  '1': {
    network: 'default',
    websockt: 'wss://test-z-asia1.dappchains.com/websocket',
    queryws: 'wss://test-z-asia1.dappchains.com/queryws'
  },
  '4': {
    network: 'asia1',
    websockt: 'wss://test-z-asia1.dappchains.com/websocket',
    queryws: 'wss://test-z-asia1.dappchains.com/queryws'
  },
  'asia1': {
    network: 'asia1',
    websockt: 'wss://test-z-asia1.dappchains.com/websocket',
    queryws: 'wss://test-z-asia1.dappchains.com/queryws'
  },
  'plasma': {
    network: 'default',
    websockt: 'wss://plasma.dappchains.com/websocket',
    queryws: 'wss://plasma.dappchains.com/queryws'
  },
  'stage': {
    network: 'default',
    websockt: 'wss://test-z-us1.dappchains.com/websocket',
    queryws: 'wss://test-z-us1.dappchains.com/queryws'
    // websockt: 'wss://plasma.dappchains.com/websocket',
    // queryws: 'wss://plasma.dappchains.com/queryws'
  },
  'local': {
    network: 'default',
    websockt: 'ws://localhost:46658/websocket',
    queryws: 'ws://localhost:46658/queryws'
  },
  'loomv2a': {
    network: 'loomv2a',
    websockt: 'ws://loomv2a.dappchains.com:46658/websocket',
    queryws: 'ws://loomv2a.dappchains.com:46658/queryws'
  },  
  'loomv2b': {
    network: 'loomv2b',
    websockt: 'ws://loomv2b.dappchains.com:46658/websocket',
    queryws: 'ws://loomv2b.dappchains.com:46658/queryws'
  },
  'default': {
    network: 'default',
    websockt: 'ws://test-z-us1.dappchains.com:46658/websocket',
    queryws: 'ws://test-z-us1.dappchains.com:46658/queryws'
  }  
}

function defaultNetworkId() {
  const domain = getDomainType()
  let loomNetwork
  if (domain === 'local' || domain == 'rinkeby') {
    loomNetwork = 'asia1'
  } else if (domain == 'stage') {
    loomNetwork = 'stage'
  } else {
    // TODO: Switch to prod chain ('plasma') 
    // when vault is fixed to not update data
    loomNetwork = 'asia1'
  }
  return loomNetwork
}

function defaultChainId() {
  return 'asia1'
}

const getChainUrls = () => {
  let chainUrlsJSON = localStorage.getItem('chainUrls')
  let chainUrls
  if (!chainUrlsJSON) {
    chainUrls = [
      clientNetwork['plasma'],
      clientNetwork['4'],      
      clientNetwork['stage'],
      clientNetwork['loomv2a'],
      clientNetwork['loomv2b']
    ]
  } else {
    chainUrls = JSON.parse(chainUrlsJSON)
  }
  return chainUrls
}

const getChainIndex = (chainUrls) => {
  let chainIndex = localStorage.getItem('chainIndex')
  if (!chainIndex || chainIndex >= chainUrls.length) chainIndex = 0
  return chainIndex
}

const getServerUrl = (chain) => {
  const url = chain.websockt || chain.rpc
  const splited = url.split('://')
  if (splited[1]) {
    return splited[1].split('/')[0]
  }
  return ''
}

const defaultState = () => {
  const chainUrls = getChainUrls()
  const chainIndex = getChainIndex(chainUrls)
  return {
    web3: undefined,
    account: undefined,
    localAddress: undefined,
    count: 0,
    networkId: defaultNetworkId(),
    chainUrls: chainUrls,
    chainIndex: chainIndex,
    dAppChainClient: undefined,
    LoomTokenNetwork: undefined,
    LoomTokenInstance: undefined,
    dposUser: undefined,
    dpos2: undefined,
    mappingStatus: undefined,
    mappingError: undefined,
    metamaskStatus: undefined,
    metamaskError: undefined
  }
}

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getAccount(state) {
      return state.account
    },
    networks() {
      return clientNetwork
    },
    currentChain(state) {
      const network = state.chainUrls[state.chainIndex]
      return network.websockt || network.rpc || ''
    },
    currentChainId(state) {
      const network = state.chainUrls[state.chainIndex]
      return network.network
    },
    currentRPCUrl(state) {
      const network = state.chainUrls[state.chainIndex]
      return 'https://' + getServerUrl(network) + '/rpc'
      // if (network.rpc) return network.rpc
      // if (network.websockt) {
      //   const splited = network.websockt.split('://')
      //   if (splited[1]) {
      //     return 'https://' + splited[1].split('/')[0] + '/rpc'
      //   }
      // }
      // return ''
    },
    defaultNetworkId,
    dappchainEndpoint(state) {
      const network = state.chainUrls[state.chainIndex]      
      let protocol = state.chainIndex === "1" ? 'https://' : 'http://'
      return 'https://' + getServerUrl(network)
    },
  },
  mutations: {
    updateState(state, payload) {
      state.account = payload.account
      state.dAppChainClient = payload.dAppChainClient
      state.localAddress = payload.localAddress
      // state.LoomTokenNetwork = payload.LoomTokenNetwork
      // state.LoomTokenInstance = payload.LoomTokenInstance
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
    }
  },
  actions: {
    addChainUrl({ state, dispatch }, payload) {
      const chains = state.chainUrls
      const existingIndex = chains.findIndex(chain => {
        return chain.websockt === payload.url || chain.rpc === payload.url
      })
      if (existingIndex >= 0) {
        if (state.chainIndex === existingIndex) return false
        state.chainIndex = existingIndex
        localStorage.setItem('chainIndex', state.chainIndex)
      } else {
        let websockt, rpc
        if (payload.url.startsWith('ws')) {
          websockt = payload.url
        } else {
          rpc = payload.url
        }
        const chain = {
          network: defaultChainId(),
          websockt,
          rpc
        }
        chains.push({
          ...chain,
          queryws: 'wss://' + getServerUrl(chain) + '/queryws'
        })
        state.chainUrls = chains
        state.chainIndex = state.chainUrls.length - 1
      }
      localStorage.setItem('chainIndex', state.chainIndex)
      localStorage.setItem('chainUrls', JSON.stringify(state.chainUrls))
      
      return true
    },
    registerWeb3({ commit, state, getters }, payload) {
      try {
        commit('setWeb3', payload.web3)
        const network = state.chainUrls[state.chainIndex].network
        const LoomTokenNetwork = LoomTokenJSON.networks[network]
        const LoomTokenInstance = new payload.web3.eth.Contract(LoomTokenJSON.abi, LoomTokenNetwork.address)
        state.LoomTokenNetwork = LoomTokenNetwork
        state.LoomTokenInstance = LoomTokenInstance
      } catch (err) {
        console.error(err)
      }
    },
    async getMetamaskLoomBalance({ state , commit}, payload) {
      if (!state.web3) return 0

      const web3js = state.web3
      const accounts = await web3js.eth.getAccounts()
      if (accounts.length === 0) return 0
      const address = accounts[0]
      try {
        let balance = web3js.utils.fromWei(await state.LoomTokenInstance.methods
          .balanceOf(address)
          .call({ from: address }))
      let limitDecimals = parseFloat(balance).toFixed(2)
      return limitDecimals
      } catch (err) {
        commit('setErrorMsg', {msg: "Error getting metamask balance", forever: false, report:true, cause:err}, {root: true})
        return 0
      }
    },
    async initDposUser({ state, rootState, getters, dispatch, commit }) {
      if (!rootState.DPOS.web3) {
        await dispatch("DPOS/initializeDependencies", null, { root: true })
      }
      const privateKeyString = localStorage.getItem('privatekey')
      if (!privateKeyString) {
        // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
        throw new Error('No Private Key, Login again')
      }
      
      const network = state.chainUrls[state.chainIndex].network
      const user = await DPOSUser.createMetamaskUserAsync(
        rootState.DPOS.web3,
        getters.dappchainEndpoint,
        privateKeyString,
        network,
        GatewayJSON.networks[network].address,
        LoomTokenJSON.networks[network].address
      );
      state.dposUser = user
    },
    async depositAsync({ state, dispatch }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      }

      // const mappingExist = await dispatch('ensureIdentityMappingExists')
      // if (!mappingExist) {
      //   console.log('Did not mapped with dAppChain Address')
      //   await await dispatch('addMappingAsync')
      // }
      
      const {amount} = payload
      const user = state.dposUser
      let weiAmount = state.web3.utils.toWei(amount, 'ether')
      const tx = await user.depositAsync(new BN(weiAmount, 10))
      await tx.wait()
    },
    async withdrawAsync({ state, dispatch }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      }

      const {amount} = payload
      const user = state.dposUser
      let weiAmount = state.web3.utils.toWei(amount, 'ether')
      const tx = await user.withdrawAsync(new BN(weiAmount, 10))
      await tx.wait()

    },
    async approveAsync({ state, dispatch }, payload) {

      if (!state.dposUser) {
        await dispatch('initDposUser')
      }

      const { amount } = payload
      const user = state.dposUser
      
      const token = user.ethereumLoom
      const gateway = user.ethereumGateway
      await token.approve(gateway.address, amount)
      
    },
    async getDappchainLoomBalance({ rootState, state, dispatch }) {
      if (!state.dposUser) {
        try {
          await dispatch('initDposUser')
        } catch (err) {
          console.error("Error getting Loom balance", err)
          return 0
        }
      }
      let loomWei = await state.dposUser.getDAppChainBalanceAsync()      
      const balance = state.web3.utils.fromWei(loomWei.toString(), 'ether')
      let limitDecimals = parseFloat(balance).toFixed(2)
      return limitDecimals
    },
    async delegateAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {

        await dispatch('initDposUser')
      }      
      try {       
        let weiAmount = state.web3.utils.toWei(payload.amount, 'ether') 
        let tier = parseInt(payload.tier)
        const result = await state.dposUser.delegateAsync(payload.candidate, new BN(weiAmount, 10), tier)
        commit('setSuccessMsg', {msg: `Success delegating ${payload.amount} tokens`, forever: false}, {root: true})
      } catch(err) {
        commit('setErrorMsg', {msg: "Error delegating", forever: false, report:true, cause:err}, {root: true})
      }      
    },
    async undelegateAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      }
      let weiAmount = state.web3.utils.toWei(payload.amount, 'ether')    
      let loomAmount = weiAmount / 10 ** 18
      try {
        const result = await state.dposUser.undelegateAsync(payload.candidate, new BN(weiAmount,10))
        commit('setSuccessMsg', {msg: `Success un-delegating ${loomAmount} tokens`, forever: false}, {root: true})
      } catch(err) {
        commit('setErrorMsg', {msg: "Failed to undelegate", forever: false, report:true, cause:err}, {root: true})
      }
    }, 
    async getValidatorsAsync({ state, dispatch }, payload) {
      const dpos2 = await dispatch('getDpos2')
      const [dpos2Validators,dpos2Candidates,dpos2Delegations] = await Promise.all([
        dpos2.getValidatorsAsync(),
        dpos2.getCandidatesAsync(),
        dpos2.getAllDelegations()
      ]).then( async (all) => all)
      const keyedDelegTotals = dpos2Delegations
        .filter(dc => dc.delegationsArray.length > 0 )
        .reduce((agg,dc) => {
          agg.push(...dc.delegationsArray);
          return agg;
        },[])
        .reduce((agg,delegation) => {
          let key = delegation.validator.local.toString();
          if (key in agg) agg[key] = agg[key].add(delegation.amount)
          else  agg[key] = delegation.amount
          return agg;
        },{})
      //debugger

      let whitelist = {
        "NGC_LOOM": new BN("5999982000000000000000000"), 
        "plasma-0": new BN("10000000000000000000000000"),
        "plasma-1": new BN("10000000000000000000000000"),
        "plasma-3": new BN("10000000000000000000000000"),
        "plasma-4": new BN("10000000000000000000000000"),
        "stakewith.us": new BN("11746840000000000000000000")
      }

      const candidateList = dpos2Candidates.map((candidate,i) => {
        let address = LocalAddress.fromPublicKey(candidate.pubKey).toString();
        let delegationTotal = keyedDelegTotals[address] ? keyedDelegTotals[address] : new BN(0);
        let whitelistAmount = whitelist[candidate.name] || new BN("1250000000000000000000000");
        let totalStaked = delegationTotal.add(whitelistAmount);
        console.log(delegationTotal.toString(),totalStaked.toString())
        return {
          pubKey: CryptoUtils.Uint8ArrayToB64(candidate.pubKey),
          address,
          active: false,
          website: candidate.website,
          description: candidate.description,
          fee: candidate.fee.toString(),
          name: candidate.name,
          delegationsTotal: delegationTotal.toString(),
          totalStaked: totalStaked.toString()
        }
      })
      const combination = [...candidateList]
      for (let validator of dpos2Validators) {
        const pubKey = CryptoUtils.Uint8ArrayToB64(validator.pubKey)
        const index = candidateList.findIndex(e => e.pubKey === pubKey)
        if (index < 0) {
          combination.push({
            pubKey,
            active: false,
            stake: validator.power.toString()
          })
        } else {
          combination[index].active = true
          combination[index].stake = validator.delegationTotal.toString()
        }
      }
      return combination
    },
    async getAccumulatedStakingAmount({ state, dispatch }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      }      
      const totalDelegation = await state.dposUser.getTotalDelegationAsync()
      const amount = formatToCrypto(totalDelegation.amount)
      return amount
    },
    async checkDelegationAsync({ state, dispatch}, payload) {
      const privateKeyString = localStorage.getItem('privatekey')
      if (!privateKeyString) {
        // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
        throw new Error('No Private Key, Login again')
      }

      const dpos2 = await dispatch('getDpos2', {
        privateKey: privateKeyString
      })
      const privateKey = CryptoUtils.B64ToUint8Array(privateKeyString)
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
      const chainId = state.chainUrls[state.chainIndex].network
      const result = dpos2.checkDelegationAsync(
        new Address(chainId, LocalAddress.fromPublicKey(CryptoUtils.B64ToUint8Array(payload.validator))),
        new Address(chainId, LocalAddress.fromPublicKey(publicKey)))
      return result
    },
    async getDpos2({ state }, payload) {
      if (!payload && state.dpos2) return state.dpos2
      const networkConfig = state.chainUrls[state.chainIndex]

      let privateKey
      if (payload && payload.privateKey) {
        privateKey = CryptoUtils.B64ToUint8Array(payload.privateKey)
      } else {
        privateKey = CryptoUtils.generatePrivateKey()
      }

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

      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

      client.txMiddleware = [
        new NonceTxMiddleware(publicKey, client),
        new SignedTxMiddleware(privateKey)
      ]
      client.on('error', msg => {
        console.error('PlasmaChain connection error', msg)
      })

      const dpos2 = await DPOS2.createAsync(client, new Address(networkConfig.network, LocalAddress.fromPublicKey(publicKey)))
      state.dpos2 = dpos2
      return dpos2
    },
    async ensureIdentityMappingExists({ rootState, state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      }

      if(!state.localAddress) return
      let metamaskAddress = ""

      if(payload) {
        metamaskAddress = payload.currentAddress
      } else {
        metamaskAddress = rootState.DPOS.currentMetamaskAddress.toLowerCase()
      }

      try {
        const mapping = await state.dposUser.addressMapper.getMappingAsync(state.localAddress)        
        const mappedEthAddress = mapping.to.local.toString()   
        let dappchainAddress = mappedEthAddress.toLowerCase()
        if(dappchainAddress !== metamaskAddress) {
          commit('setErrorMsg', {msg: `Existing mapping does not match`, forever: false}, {root: true})
          commit('setMappingStatus', 'INCOMPATIBLE_MAPPING')
          commit('setMappingError', { dappchainAddress, metamaskAddress, mappedEthAddress })
          return
        }
        if(state.mappingStatus == 'INCOMPATIBLE_MAPPING') {
          commit('setMappingError', null)
          commit('setMappingStatus', null)
        }         
      } catch (err) {
        commit("DPOS/setStatus", "no_mapping", {root: true})
        console.error("Error ensuring mapping exists: ", err)
        // commit('setErrorMsg', {msg: `Error mapping identities, please try again`, forever: true}, {root: true})
        return
      }
      commit("DPOS/setStatus", "mapped", {root: true})
    },
    async addMappingAsync({ state, dispatch, commit }, payload) {
      if (!state.dposUser) {
        await dispatch('initDposUser')
      } try {
        await state.dposUser.mapAccountsAsync()
        commit("DPOS/setStatus", "mapped", {root: true})
      } catch (err) {
        commit('setErrorMsg', {msg: "Failed establishing mapping", forever: false, report:true, cause: err}, {root: true})
      }
    },
    async init({ state, commit, rootState }, payload) {

      let privateKey
      let privateKeyString = localStorage.getItem('privatekey')

      if (!privateKeyString) {
        // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
        return
      }

      privateKey = CryptoUtils.B64ToUint8Array(privateKeyString)
      let account

      const networkConfig = state.chainUrls[state.chainIndex]

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
