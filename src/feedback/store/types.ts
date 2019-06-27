/**
 * @module dashboard.feedback
 */

// Interface for root stores that support EthereumState
export interface HasFeedbackState {
  feedback: FeedbackState
}

export interface FeedbackState {
  notification: {
    type: "info" | "success" | "danger",
    message: string,
  },
  progress: {
    task: string,
    steps: string[],
    currentStep: number,
  },
  alert: {
    type: "alert" | "confirmation"
    title: string,
    message: string,
    onConfirm(): any,
  },
  isLoading: boolean,
}
