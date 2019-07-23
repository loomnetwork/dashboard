import { DPOSState, DPOSConfig } from "./types"
import BN from "bn.js"

export function setConfig(state: DPOSState, config: DPOSConfig) {
  state.bootstrapNodes = config.bootstrapNodes.map((a) => a.toLowerCase())
}

export function setElectionTime(state: DPOSState, electionTime: Date) {
  state.electionTime = electionTime
  state.loading.electionTime = false
}

export function setAnalyticsData(state: DPOSState, payload: object) {
  state.analyticsData = payload
}
