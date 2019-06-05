import { CommonState } from "./types"
import * as mutations from "./mutations"
import { BareActionContext } from "vuex-typex"
import { getStoreBuilder } from "vuex-typex"
import { DashboardState } from "@/types"
import Web3 from "web3"

export const state: CommonState = {
  web3: null,
  route: null,
  user: null,
  privateKey: null,
  retrievedBackerInfo: false,
  userIsLoggedIn: JSON.parse(sessionStorage.getItem("userIsLoggedIn") || "null")
    ? true
    : false,
  tiers: [],
  errorMsg: null,
  successMsg: null,
  showLoadingSpinner: false,
  alternateBackground: true,
  loadingSpinnerMsg: "",
  packages: [],
  ableToProceed: false, // everything is ready, MM installed and logged in, user has account, contract deployed
  hasPendingApprove: false,
  pendingApprove: 0,
  metaMaskUserSignature: "",
  userTiers: 0,
  modalTab: "login",
}

const builder = getStoreBuilder<DashboardState>().module("common", state)
const stateGetter = builder.state()

const CommonTypedStore = {
  get state() {
    return stateGetter()
  },

  // getters
  get getPrivateKey() {
    return builder.read(getPrivateKey)
  },
  get getUserIsLoggedIn() {
    return builder.read(getUserIsLoggedIn)
  },

  // mutations
  setWeb3: builder.commit(mutations.setWeb3),
  setUser: builder.commit(mutations.setUser),
  setErrorMsg: builder.commit(mutations.setErrorMsg),
  setSuccessMsg: builder.commit(mutations.setSuccessMsg),
  setSuccess: builder.commit(mutations.setSuccess),
  setUserIsLoggedIn: builder.commit(mutations.setUserIsLoggedIn),
  signOut: builder.commit(mutations.signOut),

  // actions
  registerWeb3: builder.dispatch(registerWeb3),
  setError: builder.dispatch(setError),
}

function getPrivateKey(_: CommonState) {
  if (state.privateKey) return state.privateKey
  return sessionStorage.getItem("privatekey")
}
function getUserIsLoggedIn(_: CommonState) {
  return !!JSON.parse(sessionStorage.getItem("userIsLoggedIn") || "")
}

const CommonStore = builder.vuexModule()

// shorhand
declare type ActionContext = BareActionContext<CommonState, DashboardState>

function registerWeb3(ctx: ActionContext, payload: { web3: Web3 }) {
  // @ts-ignore
  CommonTypedStore.setWeb3(payload.web3)
}

function setError(
  ctx: ActionContext,
  payload: { err: any; msg: string; report?: boolean; cause?: Error },
) {
  const { msg, err } = payload
  let errMsg = msg
  if (err.toString().includes("User denied transaction signature")) {
    errMsg = "Transaction cancelled"
  } else if (
    err.toString().includes("cant burn coins more than available balance")
  ) {
    errMsg = "Insufficient funds"
  }

  CommonTypedStore.setErrorMsg({ msg: errMsg, forever: false })
}

// typed api + plain vuex
export { CommonTypedStore, CommonStore }
