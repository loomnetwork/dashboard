import { FeedbackState } from "./types"

export function setTask(state: FeedbackState, task: string) {
    state.task = task
}

export function setStep(state: FeedbackState, step: string) {
    state.steps.push(step)
}

export function endTask(state: FeedbackState) {
    state.task = ""
    state.steps = []
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
