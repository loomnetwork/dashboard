import { DelegationState, LocktimeTier } from "loom-js/dist/proto/dposv3_pb"
import Vue from "vue"
import BN from "bn.js"
import { formatToLoomAddress } from "./utils"
import BigNumber from "bignumber.js"

const delegationStateText = ["Bonding", "Bonded", "Unbonding", "Redelegating"]
const lockTimeTierText = ["2 weeks", "3 months", "6 months", "1 year"]
const lockTimeTierBonus = [1, 1.5, 2, 3]
import marked from "marked"

export function initFilters() {
  Vue.filter("delegationState", formateDelegationState)
  Vue.filter("lockTimeTier", formateLockTimeTier)
  Vue.filter("lockTimeBonus", formatLockTimeBonus)
  // Vue.filter('duration', formatDuration)
  Vue.filter("date", formatDate)
  Vue.filter("dateWithoutTime", dateWithoutTime)
  Vue.filter("readableDate", readableDateTime)
  Vue.filter("bn", formatBN)
  Vue.filter("bigNumber", formatBigNumber)
  Vue.filter("tokenAmount", formatTokenAmount)
  Vue.filter("domain", formatDomain)
  Vue.filter("url", formatUrl)
  // Vue.filter('timeFromNow', formatDurationFromNow)
  Vue.filter("loomAddress", formatToLoomAddress)
  Vue.filter("capitalizeWord", capitalizeWord)

  Vue.filter("marked", marked)
}

export function formatValidatorWebsite(validator: { Website: string }) {
  const str = validator.Website || "https://loomx.io/"
  return str.match(/^http/) ? validator.Website : "https://" + validator.Website
}

export function formateDelegationState(value: DelegationState) {
  return delegationStateText[value] || "Unknown"
}

export function formateLockTimeTier(value: LocktimeTier) {
  return lockTimeTierText[value] || "Unknown"
}

export function formatLockTimeBonus(value: LocktimeTier) {
  return lockTimeTierBonus[value] || "Unknown"
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})
export function formatDate(timestamp) {
  return DATE_TIME_FORMAT.format(new Date(parseInt("" + timestamp, 10) * 1000))
}

export function readableDateTime(timestamp) {
  console.log("date", timestamp)
  return new Date(timestamp * 1000).toLocaleDateString()
}

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
})
export function dateWithoutTime(timestamp) {
  return DATE_FORMAT.format(new Date(parseInt("" + timestamp, 10) * 1000))

}

/**
 * For some validator website property contains a domain
 * for other the url...
 * @param domainOrUrl
 */
export function formatDomain(domainOrUrl: string) {
  return (domainOrUrl || "").replace(/^https?:\/\//, "")
}
/**
 * For some validator website property contains a domain
 * for other the url...
 * @param domainOrUrl
 */
export function formatUrl(domainOrUrl: string) {
  return (domainOrUrl || "").match(/^https?:\/\//)
    ? domainOrUrl
    : "https://" + domainOrUrl
}

export function formatTokenAmount(wei: BN, decimals = 18, precision?: number) {
  if (!wei) return wei
  const d = new BigNumber(10).pow(decimals)
  const c = new BigNumber(wei.toString()).dividedBy(d)
  return c.toFormat(precision)
}

export function formatBN(wei: BN, precision?: number) {
  if (!wei) return wei
  return formatBigNumber(new BigNumber(wei.toString()), precision)
}

export function formatBigNumber(num: BigNumber, precision?: number) {
  // @ts-ignore
  return num.toFormat(precision)
}

export function capitalizeWord(text: string) {
  return text.charAt(0).toUpperCase() + text.substring(1)
}
