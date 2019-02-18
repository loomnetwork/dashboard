/* eslint-disable */
import { Route } from 'vue-router'
import Contract from '../services/contract'
import ApiClient from '../services/api'
import { getDomainType, getNetworkType, DOMAIN_NETWORK_ID } from '../utils'
import * as Sentry from '@sentry/browser'
const { LoomProvider, CryptoUtils, Client, LocalAddress } = require('loom-js')

import axios from 'axios'
import { stringify } from 'postcss';

const api = new ApiClient()

export const state = {
  web3: null,
  route: null,
  contract: new Contract(),
  user: null,
  privateKey: null,
  backer: {},
  retrievedBackerInfo: false,
  userIsLoggedIn: isUserLoggedIn(),
  tiers: [],
  errorMsg: null,
  successMsg: null,
  showLoadingSpinner: false,
  alternateBackground: true,
  loadingSpinnerMsg: '',
  packages: [],
  accessToken: '',
  backerAccessToken: '',
  ableToProceed: false, // everything is ready, MM installed and logged in, user has account, contract deployed
  hasPendingApprove: false,
  pendingApprove: 0,
  metaMaskUserSignature: '',
  userTiers: 0,
  otpVerificationStatus: false,
  vaultClientToken: '',
  modalTab: 'login',
  showAnnouncement: false,
  showLottery: false,
  showCryptoBacker: false,
  cryptoBacker: null
}

function isUserLoggedIn() {
  return JSON.parse(localStorage.getItem('userIsLoggedIn')) ? true : false
}

function instantiateAxios() {

  const instance = axios.create({
    headers: { 'Authorization' : `Bearer ${state.accessToken}` }
  })

  instance.interceptors.response.use(
    response => {
      return response
    },
    error => {
      return error.response
    }
  )  

  return instance

}

export const getters = {
  getPrivateKey(state) {
    if (state.privateKey) return state.privateKey
    return localStorage.getItem('privatekey')
  },
  getUserIsLoggedIn(state) {    
    return JSON.parse(localStorage.getItem('userIsLoggedIn'))
  },  
  getAbleToProceed: state => state.ableToProceed,
  getHasPendingApprove: state => state.hasPendingApprove
}

export const mutations = {
  setWeb3(state, payload) {
    state.web3 = payload
  },
  updateContractState(state, payload) {
    state.contract = payload.contract
  },
  setUser(state, payload) {
    state.user = payload
  },
  setShowAnnouncement(state, payload) {
    state.showAnnouncement = payload
  },
  setShowLottery(state, payload) {
    state.showLottery = payload
  },
  setShowCryptoBacker(state, payload) {
    state.showCryptoBacker = payload
  },
  setCryptoBacker(state, payload) {
    state.cryptoBacker = payload
  },
  setBacker(state, payload) {
    state.backer = payload
  },
  setRetrievedBackerInfo(state, payload) {
    state.retrievedBackerInfo = payload
  },
  /**
   * displays the error message, logs it to console and reports it to sentry
   * 
   * @param {*} state 
   * @param {string|{msg:string,forever:boolean,report?:boolean,cause?:Error}} payload a simple string or an object with:
   *  -  a message, 
   *  - `forever` weither to keep the message displayed or auto dismiss (current value is 10 seconds)
   *  - `report` weither to report error to sentry (if not set, does not report)
   *  - `cause` the underlying error if any that caused this error (optional, in wich case only the message is sent)
   */   
  setErrorMsg(state, payload) {
    if (typeof payload === 'string') {
      state.errorMsg = payload
    }
    else if (payload && typeof payload === 'object' ) {
      state.errorMsg = payload.msg
      if (!payload.forever) {
        setTimeout(() => {
          state.errorMsg = null
        }, 10000)
      }
      // too many ifs maybe we should standardize the payload a bit more
      // also, interesting stuff to add for more context:
      // current route, isUserLoggedIn, walletType, wallet connection status...
      // there's sentry.configureScope for doing that.
      if (payload.report) {
        if (payload.cause) {
          payload.cause.message = payload.msg +": "+ payload.cause.message
          Sentry.captureException(payload.cause)
        }
        else {
          Sentry.captureMessage(payload.msg)
        }
      }
    }
  },
  setSuccessMsg(state, payload) {
    if (typeof payload !== 'string') {
      state.successMsg = payload.msg
      if (!payload.forever) {
        setTimeout(() => {
          state.successMsg = null
        }, 10000)
      }
    } else {
      state.successMsg = payload
      setTimeout(() => {
        state.successMsg = null
      }, 10000)
    }
  },
  setUserIsLoggedIn(state, payload) {
    state.userIsLoggedIn = payload
  },
  setAccessToken(state, payload) {
    state.accessToken = payload
  },
  setApproveToken(state, payload) {
    state.hasPendingApprove = payload > 0
    state.pendingApprove = payload
  },
  setSignature(state, payload) {
    state.metaMaskUserSignature = payload
  },
  setUserTiers(state, payload) {
    state.userTiers = payload
  },
  setOTPVerificationStatus(state, payload) {
    state.otpVerificationStatus = payload
  },
  setVaultClientToken(state, payload) {
    state.vaultClientToken = payload
  },
  setModalTab(state, payload) {
    state.modalTab = payload
  }
}

export const actions = {
  registerWeb3({ commit, state }, payload) {
    try {
      commit('setWeb3', payload.web3)
    } catch (err) {
      this._vm.$log(err)
    }
  },
  logIn({ commit, state }, payload) {
    try {
      const token = payload.token
      localStorage.setItem('accessToken', token)
      commit('setAccessToken', token)
      if (payload.requireLottery) {
        commit('setShowLottery', true)
      }
      if (payload.newLogin) {
        commit('setSuccessMsg', 'Success, please verify your OTP to sign in')
      }
    } catch (err) {
      commit('setErrorMsg', err)
    }
  },
  async logInAndCheck({ commit, state, dispatch }, payload) {
    try {
      const token = payload.token
      localStorage.setItem('accessToken', token)
      commit('setAccessToken', token)
      // if (payload.requireLottery) {
      //   commit('setShowLottery', true)
      // }
      // if(payload.newLogin){
      //   commit('setSuccessMsg', 'Success, please verify your OTP to sign in')
      // }
      const userInfo = await dispatch('getUserInfo')
      if (!userInfo) {
        return false
      }
      return true
      // if (userInfo) {
      //   if (userInfo.authy_id && userInfo.authy_id.Valid) { // has phone
      //     state.modalTab = 'otp'
      //   } else {
      //     localStorage.setItem('userIsLoggedIn', true)
      //     commit('setUserIsLoggedIn', true)
      //     return true
      //   }
      // }
    } catch (err) {
      commit('setErrorMsg', err)
    }
  },
  async loginBacker({ commit, state, dispatch }, payload) {
    commit('setAccessToken', payload)
    localStorage.setItem('accessToken', token)
    try {
      const userInfoResponse = await api.get('/user/info', true)
      if (userInfoResponse.status == 200) commit('setRetrievedBackerInfo', true)
      // TODO: Refactor to use state.user
      commit('setBacker', userInfoResponse.data)
    } catch (err) {
      commit('setErrorMsg', 'Error getting user info, please try again later')
    }
  },
  async getUserInfo({ commit, state, dispatch }) {
    try {
      const userInfoResponse = await api.get('/user/info', true)
      commit('setUser', userInfoResponse.data)
      return userInfoResponse.data
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Error retrieving user info, please try again later')
      return false
    }
  },
  async requestSignUp({ commit, state, dispatch }, payload) {
    try {
      let url = `/auth/mlink/generate?email=${payload}&kind=signup`
      let encodedUrl = encodeURI(url).replace('+', '%2b')
      const response = await api.get(encodedUrl, false)

      if (response.status == 200) {
        commit('setSuccessMsg', 'Success! Please check your mail for further instructions')
        return true
      }
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Error submitting your email, please try again')
      return false
    }
  },
  async signUpWithEmail({ commit, state ,dispatch }, payload) {
    try {
      const result = await api.post('/auth/email/signup', true, payload)
      dispatch('logIn', { token: result.data.accessToken, newLogin: true })
      return true
    } catch (err) {
      commit('setErrorMsg', 'Error logging signing up, please try again')
    }
  },
  async requestResetPassword({ commit, state, dispatch }, payload) {
    try {
      let url = `/auth/mlink/generate?email=${payload}&kind=reset`
      let encodedUrl = encodeURI(url).replace('+', '%2b')
      const response = await api.get(encodedUrl, false)

      if (response.status == 200) {
        commit('setSuccessMsg', 'Success! Please check your mail for further instructions')
        return true
      } else if (response.status == 404) {
        commit('setErrorMsg', 'Error, your email does not seem to exist')
        return false
      }
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Error requesting a reset password link, please try again')
      return false
    }
  },
  async signInWithEmail({ commit, state, dispatch }, payload) {
    try {
      const result = await api.post('/auth/email/login', false, payload)
      if (result && result.status === 200) {
        await dispatch('logInAndCheck', {
          token: result.data.accessToken,
          newLogin: true
        })
        return true
      }
      return false
    } catch (err) {
      commit('setErrorMsg', 'Error logging in, please check your email and/or password')
    }
  },
  async resetPassword({ commit, state, dispatch }, payload) {
    let createTokenResponse
    try {
      createTokenResponse = await api.post(`/auth/email/reset`, true, payload)
      if (createTokenResponse.status == 200) {
        commit('setAccessToken', createTokenResponse.data.token)
        localStorage.setItem('accessToken', createTokenResponse.data.token)
        return true
      } else if (createTokenResponse.data.error) {
        commit('setErrorMsg', createTokenResponse.data.error)
        return false
      }
    } catch (err) {
      this._vm.$log(err)
      return false
    }
  },
  async setPhoneNumberWithToken({ commit, state, dispatch }, payload) {
    try {
      let instance = axios.create({
        headers: {
          Authorization: 'Bearer ' + payload.access_token
        }
      })
      return await instance.post(`${api.baseUrl}/auth/email/addauthy`, payload.phone)
    } catch (e) {
      console.error(e)
      return false
    }
  },
  signOut({ commit, state }, payload) {
    try {
      state.privateKey = null
      state.vaultClientToken = ''
      localStorage.removeItem('privatekey')
      localStorage.removeItem('vaultToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userIsLoggedIn')
      commit('setUserIsLoggedIn', false)
      commit('setSuccessMsg', 'You have successfully signed out')
    } catch (err) {
      commit('setErrorMsg', err)
    }
  },
  async resendOTP({ commit, state }) {
    try {
      const result = await api.get('/auth/otp/request', true)
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Failed requesting OTP, please try again')
    }
  },
  async submitOTP({ commit, state, dispatch }, payload) {

    /**
     * Stores an OTP code in Vault
     * Used for both sign in and sign up
     *
     * @param {string} payload The OTP provided by the user
     * @returns {bool}
     */

    try {

      let instance = axios.create({
        headers: {}
      })
      // Delete as Vault does not permit 'Authorization' header
      delete instance.defaults.headers.common["Authorization"];
      const domain = getDomainType()
      let base;
      if (domain == 'local' || domain == 'rinkeby') {
        base = 'https://vault-dc2.devdc.io'
      } else if (domain == 'stage') {
        base = 'https://stage-vault.delegatecall.com'
      } else {
        base = 'https://vault.delegatecall.com'
      }

      state.privateKey = null
      state.vaultClientToken = ''
      localStorage.removeItem('privatekey')
      localStorage.removeItem('vaultToken')
      // Make initial POST to retireve X-Vault-Token
      const createTokenResponse = await instance.post(`${base}/v1/auth/loom-userpass/create_token`, payload)
      commit('setVaultClientToken', createTokenResponse.data.auth.client_token)
      localStorage.setItem('vaultToken', createTokenResponse.data.auth.client_token)

      localStorage.setItem('userIsLoggedIn', true)
      commit('setUserIsLoggedIn', true)
      await dispatch('getPrivateKey', createTokenResponse)
      return true
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Verification failed.')
      return false
    }
  },
  async getGoogleAuth({ commit }) {
    try {
      let instance = axios.create({
        headers: {}
      })

      delete instance.defaults.headers.common["Authorization"];
      const domain = getDomainType()
      let base

      if (domain == 'local' || domain == 'rinkeby') {
        base = 'https://vault2-dc2.devdc.io/'
      } else if (domain == 'stage') {
        base = 'https://stage-vault.delegatecall.com/'
      } else {
        base = 'https://vault.delegatecall.com/'
      }

      const googleAuthParams = await instance.get(`${base}v1/auth/oauth2/params/google`)
      return googleAuthParams
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Authentication failed.')
      return false
    }
  },
  async getCubbyHoleToken({ commit, dispatch }, payload) {
    try {
      let instance = axios.create({
        headers: {}
      })
      delete instance.defaults.headers.common["Authorization"];
      const domain = getDomainType()
      let base
      
      if(domain == 'local' || domain == 'rinkeby') {
        base = 'https://vault2-dc2.devdc.io/'
      } else if (domain == 'stage') {
        base = 'https://stage-vault.delegatecall.com/'
      } else {
        base = 'https://vault.delegatecall.com/'
      }

      const cubbyHoleToken = await instance.post(`${base}v1/auth/oauth2/login/google`, JSON.stringify(payload))

      commit('setVaultClientToken', cubbyHoleToken.data.auth.client_token)
      await dispatch('getPrivateKey', cubbyHoleToken)
    } catch (err) {
      this._vm.$log(err)
      commit('setErrorMsg', 'Authentication failed.')
      return false
    }
  },
  async getPrivateKey({ commit, state, dispatch }, payload) {
    const domain = getDomainType()
    let base
    if (domain == 'local' || domain == 'rinkeby') {
      base = 'https://vault2-dc2.devdc.io/'
    } else if (domain == 'stage') {
      base = 'https://stage-vault.delegatecall.com/'
    } else {
      // TODO: Switch to prod vault ('https://vault.delegatecall.com/')
      // when vault is fixed to not update data
      base = 'https://vault2-dc2.devdc.io/'
    }

    let instance = axios.create({
      headers: { 'X-Vault-Token': payload.data.auth.client_token }
    })
    await instance.get(`${base}v1/entcubbyhole/loomauth`)
      .then(responseKey => {
        state.privateKey = responseKey.data.data.privatekey
        localStorage.setItem('privatekey', responseKey.data.data.privatekey)
        localStorage.setItem('userIsLoggedIn', true)
        commit('setUserIsLoggedIn', true)
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status == 404) {
            // let vaultConfig = {
            //   base: base,
            //   instance: instance
            // }
            // dispatch('setPrivateKey', vaultConfig)
          } else {
            throw 'Error occur when try to get privateKey'
          }
        }
      })
  },
  async setPrivateKey({ commit }, payload) {
    // const privateKey = CryptoUtils.generatePrivateKey()
    const privateKey = CryptoUtils.generatePrivateKeyFromSeed(payload.seed.slice(0, 32))
    const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)    
    const domain = getDomainType()
    let base
    if (domain == 'local' || domain == 'rinkeby') {
      base = 'https://vault2-dc2.devdc.io/'

    } else if (domain == 'stage') {
      base = 'https://stage-vault.delegatecall.com/'
    } else {
      base = 'https://vault.delegatecall.com/'
    }

    const vaultToken = localStorage.getItem('vaultToken')
    let instance = axios.create({
      headers: { 'X-Vault-Token': vaultToken }
    })

    try {
      const storeMappingResponse = await instance.post(`${base}v1/entcubbyhole/loomauth`,
        {
          'privatekey': privateKeyString
        }
      )
      state.privateKey = privateKeyString
      localStorage.setItem('privatekey', privateKeyString)
      localStorage.setItem('userIsLoggedIn', true)
      commit('setUserIsLoggedIn', true)
    } catch (err) {
      console.error(err)
    }
  },
  async testClaimRewards({commit, state, dispatch}) {
    await dispatch('DappChain/init', {}, {root:true})
    await dispatch('DappChain/claimRewards', {}, {root:true})
  },
  async updateContractState({ commit, state }) {
    const contract = new Contract()
    const hasMM = contract.hasMetaMask()
    const hasDeployed = await contract.hasContractDeployed()
    const hasAccounts = await contract.canGetAccounts()
    let tiers = []
    let approved = '0'
    let staked = '0'
    let updatedTimeStamp = 0
    let currentTier = 0
    let isValidLockinPeriod = true
    let stakedEnabled = true
    let salesApproved = '0'
    state.ableToProceed = hasMM && hasDeployed && hasAccounts
    if (state.ableToProceed) {
      // this.goToStep(0)

      await contract.loadContract()

      tiers = await contract.getTiers()
      approved = await contract.getAllowance()
      salesApproved = state.web3.utils.fromWei(await contract.getAllowanceOfSale(), 'ether')

      state.hasPendingApprove = salesApproved > 0
      state.pendingApprove = salesApproved

      if (approved >= tiers[0]) {
        currentTier = tiers.indexOf(approved) + 1
        // this.goToStep(1)
      }

      staked = await contract.getStakedValues()

      if (staked >= tiers[0]) {
        const stakeDetails = await contract.getStakeDetails()
        updatedTimeStamp = stakeDetails.updatedTimeStamp
        currentTier = stakeDetails.currentTier
        isValidLockinPeriod = stakeDetails.isValidLockinPeriod
        // this.goToStep(2)
      }
      stakedEnabled = await contract.stakeEnabled()
    } else {
      // commit("setErrorMsg", "Please install and login to Metamask or refresh to try again")
    }

    commit('updateContractState', {
      contract
      // tiers
      // contract,
      // hasMM,
      // hasDeployed,
      // hasAccounts,
      // tiers,
      // approved,
      // staked,
      // updatedTimeStamp,
      // currentTier,
      // isValidLockinPeriod,
      // stakedEnabled
    })
  },
  async initiateMetamaskSigning({ state, commit, dispatch, rootState }, payload) {
    const publicAddresses = await rootState.contract._getAccounts()
    const publicAddress = publicAddresses[0]
    const nonce = 1

    await web3.personal.sign(
      web3.fromUtf8(
        `I am signing my one-time nonce: ${nonce} with the following email: ${payload}`
      ),
      publicAddress,
      (err, res) => {
        if (err !== null) {
          this._vm.$log(err)
          commit('setErrorMsg', 'Signing failed, please try again')
        } else {
          commit('setSignature', res)
          dispatch('claimBackerRewards', payload)
        }
      }
    )
  },
  async checkNetwork({ state, commit, rootState }) {
    const domainType = getDomainType()
    const networkType = await getNetworkType()
    if (!DOMAIN_NETWORK_ID[networkType]) {
      commit(
        'setErrorMsg',
        `You're not on one of the predefined DAppChain networks, please check Metamask.`
      )
      return
    }
    if (!DOMAIN_NETWORK_ID[networkType].includes(domainType)) {
      const rightNetwork = networkType === '1' ? 'Rinkeby' : 'Mainnet'
      commit(
        'setErrorMsg',
        `You are on the wrong network, please switch to ${rightNetwork} in Metamask`
      )
    }
  },

  async checkLottery({ state, commit, rootState }) {

   let accessToken = localStorage.getItem('accessToken')
   const instance = axios.create({     
     headers: { 'Authorization' : `Bearer ${accessToken}` }
   }) 
   const lotteryResponse = await instance.get("/lottery")
   commit('setShowLottery', lotteryResponse.data.requireLottery)
  },

  async checkCryptoBacker({ state, commit, rootState }) {

    let accessToken = localStorage.getItem('accessToken')
    const instance = axios.create({     
      headers: { 'Authorization' : `Bearer ${accessToken}` }
    }) 
    const cryptoBackerResponse = await instance.get("/fiat/transaction")    
    if(cryptoBackerResponse.data.length > 0) {
      commit('setShowCryptoBacker', true)
      commit('setCryptoBacker', cryptoBackerResponse.data)
    }
   },


   setSuccess({commit}, msg) {
    commit("setSuccessMsg", msg)
    setTimeout(() => {
      commit("setSuccessMsg", "")
    }, 10000)
   },

   setError({commit}, msg) {
    commit("setErrorMsg", msg)
    setTimeout(() => {
      commit("setErrorMsg", "")
    }, 10000)
   }

}
