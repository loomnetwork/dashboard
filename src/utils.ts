/* eslint-disable no-undef, func-names */
import Web3 from "web3"
import BN from "bn.js"
import BigNumber from "bignumber.js"
import Cards from "./data/cards.json"
import CardDetails from "./data/cardDetail.json"
import tokenMetaData from "./data/topTokensSymbol.json"

const unitMap = {
  noether: "0",
  wei: "1",
  kwei: "1000",
  Kwei: "1000",
  babbage: "1000",
  femtoether: "1000",
  mwei: "1000000",
  Mwei: "1000000",
  lovelace: "1000000",
  picoether: "1000000",
  gwei: "1000000000",
  Gwei: "1000000000",
  shannon: "1000000000",
  nanoether: "1000000000",
  nano: "1000000000",
  szabo: "1000000000000",
  microether: "1000000000000",
  micro: "1000000000000",
  finney: "1000000000000000",
  milliether: "1000000000000000",
  milli: "1000000000000000",
  ether: "1000000000000000000",
  kether: "1000000000000000000000",
  grand: "1000000000000000000000",
  mether: "1000000000000000000000000",
  gether: "1000000000000000000000000000",
  tether: "1000000000000000000000000000000",
}

export function toBigNumber(num) {
  num = num || 0
  if (isBigNumber(num)) {
    return num
  }

  if (isString(num) && (num.indexOf("0x") === 0 || num.indexOf("-0x") === 0)) {
    return new BigNumber(num.replace("0x", ""), 16)
  }
  return new BigNumber(num.toString(10), 10)
}

export function isBigNumber(object) {
  return (
    object &&
    (object instanceof BigNumber ||
      (object.constructor && object.constructor.name === "BigNumber"))
  )
}

function isString(object) {
  return (
    typeof object === "string" ||
    (object && object.constructor && object.constructor.name === "String")
  )
}

export function getValueOfUnit(unit) {
  unit = unit ? unit.toLowerCase() : "ether"
  const unitValue = unitMap[unit]
  if (unitValue === undefined) {
    throw new Error(`Unknown unit '${unit}'`)
  }
  return new BigNumber(unitValue, 10)
}

export function getDomainType() {
  const host = window.location.host
  if (host && !host.includes("local")) {
    return host.split(".")[0]
  }
  return "local"
}

export async function getNetworkType() {
  // @ts-ignore
  if (typeof window.web3 !== "undefined") {
    return new Promise((resolve) => {
      // @ts-ignore
      web3.version.getNetwork((err, netId) => {
        resolve(netId)
      })
    })
  }
  return null
}

export function formatToCrypto(amount) {
  const conversion = new BigNumber(amount / 10 ** 18, 10)
  // show gwei if less than one
  return conversion.lt(1) && conversion.gt(0)
    ? conversion.toFormat(9)
    : conversion.toFormat(2)
}

export function parseToWei(amount: string) {
  return new BN(amount).mul(new BN(`${10 ** 18}`))
}

export const DOMAIN_NETWORK_ID = {
  1: ["loom"],
  4: ["rinkeby", "stage", "local"],
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

export const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

const capitalize = (s) => {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const simpleMutations = (stateName) => ({
  [`set${capitalize(stateName)}`]: (state, payload) =>
    (state[stateName] = payload),
})

export const buildMutationsFromState = (state) =>
  Object.assign({}, ...Object.keys(state).map((name) => simpleMutations(name)))

export function dynamicSort(property) {
  let sortOrder = 1
  if (property[0] === "-") {
    sortOrder = -1
    property = property.substr(1)
  }
  return (a, b) => {
    const result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
    return result * sortOrder
  }
}

export function getCardByTokenId(id: string) {
  let cardDetail = CardDetails[id]
  let card
  if (!cardDetail) {
    cardDetail = defaultCardData
    card = Object.assign({}, cardDetail)
  } else {
    card = Object.assign(
      {},
      defaultCardData,
      Cards.cards.find((cd) => parseInt(cd.mould_type, 10) === cardDetail.mouldId),
    )
    const variation = cardDetail.variant.replace("-edition", "")
    card.variation = variation === "backers" ? "backer" : variation
  }
  card.id = id
  return card
}

export const defaultCardData = {
  display_name: "Card",
  priceInUSD: 0.0,
  priceInETH: 0.0,
  image: "question_card",
  title: "A Great Zombie",
  inventory: 0,
  variant: "standard-edition",
  variation: "standard",
  mould_type: "001",
  element: "AIR",
  originalID: "001",
  id: "001",
  tradeable: false,
}

export function formatToLoomAddress(address: string) {
  if (address.slice(0, 2) === "0x") {
    return address.replace("0x", "loom")
  } else {
    return address
  }
}

export function formatFromLoomAddress(address: string) {
  if (address.slice(0, 4) === "loom") {
    return address.replace("loom", "0x")
  } else {
    return address
  }
}

export function getRequired<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new Error("Value required but was null " + name)
  }
  return value
}

export function getTokenSymbolFromAddress(address: string) {
  // TODO: Change to US-1
  const chainPrefix = "rinkeby-us1"
  return tokenMetaData.tokens.find((token) => {
    return token.address[chainPrefix].toLowerCase() === address.toLowerCase()
  })
}