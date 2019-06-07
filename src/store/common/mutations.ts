import { CommonState } from "./types"
import Web3 from "web3"
import * as Sentry from "@sentry/browser"

export function setWeb3(state: CommonState, payload: Web3) {
  state.web3 = payload
}
export function setUser(state: CommonState, payload) {
  state.user = payload
}

export function setErrorMsg(
  state: CommonState,
  payload:
    | string
    | { msg: string; forever: boolean; report?: boolean; cause?: any },
) {
  if (typeof payload === "string") {
    state.errorMsg = payload
  } else if (payload && typeof payload === "object") {
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
        payload.cause.message = payload.msg + ": " + payload.cause.message
        console.error(payload.cause)
        Sentry.captureException(payload.cause)
      } else {
        console.error(payload.msg)
        Sentry.captureMessage(payload.msg)
      }
    }
  }
}

export function setSuccess(
  state: CommonState,
  payload: string | { msg: string; forever: boolean },
) {
  if (typeof payload !== "string") {
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
}

export function setSuccessMsg(
  state: CommonState,
  payload: string | { msg: string; forever: boolean },
) {
  if (typeof payload !== "string") {
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
}
export function setUserIsLoggedIn(state: CommonState, payload: boolean) {
  state.userIsLoggedIn = payload
}

// this should be just a mutation
export function signOut(state: CommonState) {
  state.privateKey = null
  state.userIsLoggedIn = false
  state.successMsg = "You have successfully signed out"
  sessionStorage.removeItem("privatekey")
  sessionStorage.removeItem("userIsLoggedIn")
}

export function setShowLoadingSpinner(state: CommonState, payload: boolean) {
  console.log("|======= common setShowLoadingSpinner =======|", payload)
  state.showLoadingSpinner = payload
}
