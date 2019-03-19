import { DelegationState, LockTimeTier } from "loom-js/dist/contracts/dpos2";
import Vue from 'vue'
import BN from 'bn.js';
import { formatToCrypto } from './utils.js';


// https://github.com/palantir/blueprint/issues/959#issuecomment-335965129\
const durationFormat = require("moment-duration-format")
let moment = require("moment");
if ("default" in moment) {
    moment = moment["default"];
}
durationFormat(moment)

const delegationStateText = ["Bonding","Bonded","Unbonding","Redelegatin"]
const lockTimeTierText = ["2 weeks","3 months","6 months","1 year"]
const lockTimeTierBonus = [1,1.5,2,3]
export function initFilters() {
    Vue.filter("delegationState",formateDelegationState)
    Vue.filter("lockTimeTier",formateLockTimeTier)
    Vue.filter("lockTimeBonus",formatLockTimeBonus)
    Vue.filter('duration', formatDuration)
    Vue.filter('date', formatDate)
    Vue.filter('tokenAmount', formatTokenAmount)
    Vue.filter('validatorWebsite', formatValidatorWebsite)
    Vue.filter('timeFromNow', formatDurationFromNow)
    
}

export function formatValidatorWebsite(validator:{Website:string}) {
    const str = validator.Website || "https://loomx.io/"
    return str.match(/^http/) ? 
        validator.Website : 
        "https://" + validator.Website
}

export function formateDelegationState(value:DelegationState) {
    return delegationStateText[value] || "Unknown"
}

export function formateLockTimeTier(value:LockTimeTier) {
    return lockTimeTierText[value] || "Unknown"
}

export function formatLockTimeBonus(value:LockTimeTier) {
    return lockTimeTierBonus[value] || "Unknown"
}



export function formatDuration(seconds:number) {
    console.log(seconds)
    if (!seconds) return '0'
    // @ts-ignore
    return  moment.duration(seconds, "seconds").format();
}

export function formatDurationFromNow(unixTimestamp) {
    // @ts-ignore poorly typed duration format moment plugin
    //return moment.duration(parseInt(unixTimestamp)*1000 - Date.now()).format()
    // alternativaly
    console.log(unixTimestamp,Date.now())
    console.log(moment.duration(parseInt(unixTimestamp)*1000 - Date.now()))
    return moment.duration(parseInt(unixTimestamp)*1000 - Date.now()).humanize(true)
}

export function formatDate(unixTimestamp) {
    console.log("date",unixTimestamp)
    return new Date(parseInt(unixTimestamp,10)*1000).toString()
}

export function formatTokenAmount(wei:BN) {
    return formatToCrypto(wei.toString())
}

