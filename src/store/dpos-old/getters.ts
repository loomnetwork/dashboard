import { LocalAddress } from "loom-js"
import { formatToCrypto, dynamicSort } from "@/utils"
import { DashboardState, DposState } from "@/types"

export function getLatestBlockNumber(state: DposState) {
  return (
    state.latestBlockNumber ||
    JSON.parse(sessionStorage.getItem("latestBlockNumber") || "")
  )
}
export function getCachedEvents(state: DposState) {
  return (
    state.cachedEvents ||
    JSON.parse(sessionStorage.getItem("cachedEvents") || "[]")
  )
}
export function getDashboardAddressAsLocalAddress(state: DposState) {
  return LocalAddress.fromHexString(state.dashboardAddress)
}
export function getFormattedValidators(state: DposState) {
  return state.validators
    .map((validator) => {
      let Weight = 0
      if (validator.name.startsWith("plasma-")) {
        Weight = 1
      } else if (validator.name === "") {
        Weight = 2
      }
      const validatorName =
        validator.name !== "" ? validator.name : validator.address
      const isBootstrap = validator.isBootstrap
      return {
        Address: validator.address,
        // Active / Inactive validator
        Status: validator.active ? "Active" : "Inactive",
        totalStaked: formatToCrypto(validator.totalStaked),
        delegationsTotal: formatToCrypto(validator.delegationsTotal),
        personalStake: formatToCrypto(validator.personalStake),
        delegatedStake: formatToCrypto(validator.delegatedStake),
        // Whitelist + Tokens Staked * Bonuses
        votingPower: formatToCrypto(validator.votingPower || 0),
        // Validator MEtadata
        Name: validatorName,
        Description: validator.description || null,
        Website: validator.website || null,
        Fees: isBootstrap ? "N/A" : (validator.fee || "0") + "%",
        isBootstrap,
        Weight,
        _cellVariants: {
          Status: validator.active ? "active" : "inactive",
          Name: isBootstrap ? "danger" : undefined,
        },
      }
    })
    .sort(dynamicSort("Weight"))
}

export function getWithdrewOn(state: DposState) {
  const s = localStorage.getItem("lastWithdrawTime") || "0"
  return parseInt(s, 10)
}
