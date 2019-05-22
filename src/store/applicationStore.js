import { getDomainType, } from '../utils'
import * as Sentry from '@sentry/browser'
const { CryptoUtils, } = require('loom-js')

export const state = {
  web3: null,
  route: null,
  user: null,
  privateKey: null,
  locale: navigator.language || "en",
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
  cryptoBacker: null,
}

function isUserLoggedIn() {
  return JSON.parse(sessionStorage.getItem('userIsLoggedIn')) ? true : false
}

export const getters = {
  getPrivateKey(state) {
    if (state.privateKey) return state.privateKey
    return sessionStorage.getItem('privatekey')
  },
  getUserIsLoggedIn(state) {    
    return JSON.parse(sessionStorage.getItem('userIsLoggedIn'))
  },  
}

export const mutations = {
  setWeb3(state, payload) {
    state.web3 = payload
  },
  setUser(state, payload) {
    state.user = payload
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
        }, 15000)
      }
      // too many ifs maybe we should standardize the payload a bit more
      // also, interesting stuff to add for more context:
      // current route, isUserLoggedIn, walletType, wallet connection status...
      // there's sentry.configureScope for doing that.
      if (payload.report) {
        if (payload.cause) {
          payload.cause.message = payload.msg +": "+ payload.cause.message
          console.error(payload.cause);
          Sentry.captureException(payload.cause)
        }
        else {
          console.error(payload.msg);
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
        }, 15000)
      }
    } else {
      state.successMsg = payload
      setTimeout(() => {
        state.successMsg = null
      }, 15000)
    }
  },
  setUserIsLoggedIn(state, payload) {
    state.userIsLoggedIn = payload
  },
  setAccessToken(state, payload) {
    state.accessToken = payload
  },
  setLocale(state, locale) {
    state.locale = locale
  },  
}

export const actions = {
  registerWeb3({ commit, state }, payload) {
    try {
      commit('setWeb3', payload.web3)
    } catch (err) {
      this._vm.$log(err)
    }
  },
  signOut({ commit, state }, payload) {
    try {
      state.privateKey = null
      state.vaultClientToken = ''
      sessionStorage.removeItem('privatekey')
      sessionStorage.removeItem('vaultToken')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('userIsLoggedIn')
      commit('setUserIsLoggedIn', false)
      commit('setSuccessMsg', 'You have successfully signed out')
    } catch (err) {
      commit('setErrorMsg', err)
    }
  },

   setSuccess({commit}, msg) {
    commit("setSuccessMsg", msg)
   },

   setError({commit}, payload) {
    const {msg, err} = payload
    let errMsg = ""
    if(err.toString().includes("User denied transaction signature")) errMsg = "Transaction cancelled"
    if(err.toString().includes("cant burn coins more than available balance")) errMsg = "Insufficient funds" 
    errMsg ? commit('setErrorMsg', {msg: errMsg, forever: false}, {root: true}) : commit('setErrorMsg', {msg, forever: false}, {root: true})
   }

}
