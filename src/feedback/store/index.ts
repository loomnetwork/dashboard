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
  task: "",
  steps: [],
}

const builder = getStoreBuilder<HasFeedbackState>().module("feedback", initialState)
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
}

// vuex module as a service
export { feedbackModule }

declare type ActionContext = BareActionContext<FeedbackState, HasFeedbackState>
