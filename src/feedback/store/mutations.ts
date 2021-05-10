import { FeedbackState } from "./types"

export function setTask(state: FeedbackState, task: string) {
    state.progress.task = task
}

export function setStep(state: FeedbackState, step: string) {
    state.progress.steps.push(step)
    state.progress.currentStep++
}

export function endTask(state: FeedbackState) {
    state.progress.currentStep++
    state.progress.task = ""
    state.progress.steps = []
    state.progress.currentStep = -1
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

export function showAlert(state: FeedbackState, { title, message }) {
    state.alert.type = "alert"
    state.alert.title = title
    state.alert.message = message
}

export function requireConfirmation(state: FeedbackState, { title, message, onConfirm }) {
    state.alert.type = "confirmation"
    state.alert.title = title
    state.alert.message = message
    state.alert.onConfirm = onConfirm
}

export function showLoadingBar(state: FeedbackState, payload: boolean) {
    state.isLoading = payload
}
