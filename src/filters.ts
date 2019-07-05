import { DelegationState, LocktimeTier } from "loom-js/dist/proto/dposv3_pb"
import Vue from "vue"
import BN from "bn.js"
import { formatToCrypto, formatToLoomAddress } from "./utils"
import { ethers } from "ethers"
import BigNumber from "bignumber.js"

// https://github.com/palantir/blueprint/issues/959#issuecomment-335965129\
// const durationFormat = require("moment-duration-format")
// let moment = require("moment");
// if ("default" in moment) {
//     moment = moment["default"];
// }
// durationFormat(moment)

const delegationStateText = ["Bonding", "Bonded", "Unbonding", "Redelegating"]
const lockTimeTierText = ["2 weeks", "3 months", "6 months", "1 year"]
const lockTimeTierBonus = [1, 1.5, 2, 3]

export function initFilters() {
  Vue.filter("delegationState", formateDelegationState)
  Vue.filter("lockTimeTier", formateLockTimeTier)
  Vue.filter("lockTimeBonus", formatLockTimeBonus)
  // Vue.filter('duration', formatDuration)
  Vue.filter("date", formatDate)
  Vue.filter("readableDate", readableDateTime)
  Vue.filter("tokenAmount", formatTokenAmount)
  Vue.filter("domain", formatDomain)
  Vue.filter("url", formatUrl)
  // Vue.filter('timeFromNow', formatDurationFromNow)
  Vue.filter("loomAddress", formatToLoomAddress)
  Vue.filter("swapTextBase64AndHexLabel", swapTextBase64AndHexLabel)
  Vue.filter("capitalizeWord", capitalizeWord)
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

// export function formatDuration(seconds:number, unit:string='seconds') {
//     console.log(seconds)
//     if (!seconds) return '0'
//     // @ts-ignore
//     return  moment.duration(seconds, "seconds").format();
// }

// export function formatDurationFromNow(unixTimestamp) {
//     // @ts-ignore poorly typed duration format moment plugin
//     //return moment.duration(parseInt(unixTimestamp)*1000 - Date.now()).format()
//     // alternativaly
//     console.log(unixTimestamp,Date.now())
//     console.log(moment.duration(parseInt(unixTimestamp)*1000 - Date.now()))
//     return moment.duration(parseInt(unixTimestamp)*1000 - Date.now()).humanize(true)
// }
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

// export function formatTokenAmounts(wei: BN) {
//     return formatToCrypto(wei.toString())
// }

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
  const c = new BigNumber(wei.toString()).dividedBy(10 ** decimals)
  return (c.integerValue().eq(c)) ? c.toFormat(0) :
    c.lt(1) ? c.toFormat(6) : c.toFormat(2)
}

export function swapTextBase64AndHexLabel(input) {
  return input === "base64" ? "hex" : "base64"
}

export function capitalizeWord(text: string) {
  return text.charAt(0).toUpperCase() + text.substring(1)
}
