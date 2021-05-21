import "mocha"
import { expect } from "chai"

import * as mutations from "../mutations"
import { FeedbackState } from "../types"

const initialState = (): FeedbackState => {
  return {
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
}

describe("Feedback Mutations", () => {
  let state: FeedbackState

  beforeEach(() => {
    state = initialState()
  })

  it("setTask", () => {
    const task = "Test task"
    mutations.setTask(state, task)
    expect(state.progress.task).to.equal(task)
  })

  it("setStep", () => {
    const step = "Test step"
    mutations.setStep(state, step)
    expect(state.progress.steps[0]).to.equal(step)
    expect(state.progress.currentStep).to.equal(0)
  })

  it("endTask", () => {
    mutations.setTask(state, "task")
    mutations.setStep(state, "step0")
    expect(state.progress.currentStep).to.equal(0)
    mutations.endTask(state)
    setTimeout(() => {
      expect(state.progress.task, "task").to.equal("")
      expect(state.progress.steps.length, "steps.length").to.equal(0)
      expect(state.progress.currentStep, "currentStep").to.equal(-1)
    }, 1500)
  })

  it("showInfo", () => {
    const message = "Test message"
    mutations.showInfo(state, message)
    expect(state.notification.type).to.equal("info")
    expect(state.notification.message).to.equal(message)
  })

  it("showSuccess", () => {
    const message = "Test message"
    mutations.showSuccess(state, message)
    expect(state.notification.type).to.equal("success")
    expect(state.notification.message).to.equal(message)
  })

  it("showError", () => {
    const message = "Test message"
    mutations.showError(state, message)
    expect(state.notification.type).to.equal("danger")
    expect(state.notification.message).to.equal(message)
  })

  it("showAlert", () => {
    const title = "Test title"
    const message = "Test message"
    mutations.showAlert(state, { title, message })
    expect(state.alert.type).to.equal("alert")
    expect(state.alert.title).to.equal(title)
    expect(state.alert.message).to.equal(message)
  })

  it("requireConfirmation", () => {
    const title = "Test title"
    const message = "Test message"
    const onConfirm = () => {
      return "Confirmed"
    }
    mutations.requireConfirmation(state, { title, message, onConfirm })
    expect(state.alert.type).to.equal("confirmation")
    expect(state.alert.title).to.equal(title)
    expect(state.alert.message).to.equal(message)
    expect(state.alert.onConfirm).to.equal(onConfirm)
  })

  it("showLoadingBar", () => {
    mutations.showLoadingBar(state, true)
    expect(state.isLoading).to.equal(true)
  })
})
