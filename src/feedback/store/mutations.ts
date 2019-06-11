import { FeedbackState } from "./types"

export function setTask(state: FeedbackState, task: string) {
    state.task = task
}

export function setStep(state: FeedbackState, step: string) {
    state.steps.push(step)
    state.currentStep++
}

export function endTask(state: FeedbackState) {
    state.currentStep++
    setTimeout(() => {
        state.task = ""
        state.steps = []
        state.currentStep = -1
    }, 1500)
}

export function showInfo(state: FeedbackState, message: string) {
    state.notification.type = "info"
    state.notification.message = message
}

export function showSuccess(state: FeedbackState, message: string) {
    state.notification.type = "success"
    state.notification.message = message
}

export function showError(state: FeedbackState, message: string) {
    state.notification.type = "danger"
    state.notification.message = message
}
