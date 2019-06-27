/**
 * @module dashboard.feedback
 */

import debug from "debug"
import { BareActionContext, getStoreBuilder } from "vuex-typex"
import * as mutations from "./mutations"
import { FeedbackState, HasFeedbackState } from "./types"

const log = debug("feedback")

const initialState: FeedbackState = {
  notification: {
    type: "info",
    message: "",
  },
  progress: {
    task: "",
    steps: [],
    currentStep: -1,
  },
  alert: {
    type: "alert",
    title: "",
    message: "",
    onConfirm() {
      return
    },
  },
  isLoading: false,
}

const builder = getStoreBuilder<HasFeedbackState>().module(
  "feedback",
  initialState,
)
const stateGetter = builder.state()

const feedbackModule = {
  get state() {
    return stateGetter()
  },

  setTask: builder.commit(mutations.setTask),
  setStep: builder.commit(mutations.setStep),
  endTask: builder.commit(mutations.endTask),
  showInfo: builder.commit(mutations.showInfo),
  showSuccess: builder.commit(mutations.showSuccess),
  showError: builder.commit(mutations.showError),
  showAlert: builder.commit(mutations.showAlert),
  showLoadingBar: builder.commit(mutations.showLoadingBar),
  requireConfirmation: builder.commit(mutations.requireConfirmation),
}

// vuex module as a service
export { feedbackModule }

declare type ActionContext = BareActionContext<FeedbackState, HasFeedbackState>
