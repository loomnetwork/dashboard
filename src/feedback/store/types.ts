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
  task: string,
  steps: string[],
  currentStep: number,
}
