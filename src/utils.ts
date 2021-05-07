import BN from "bn.js"
import BigNumber from "bignumber.js"
import Cards from "./data/cards.json"
import CardDetails from "./data/cardDetail.json"
import { TokenData } from "./services/TokenService"
import productionTokens from "@/assets/tokens/production.tokens.json"
import extDevTokens from "@/assets/tokens/ext-dev.tokens.json"
import devTokens from "@/assets/tokens/dev.tokens.json"
import productionBinanceTokens from "@/assets/tokens/production.binance.tokens.json"
import extDevBinanceTokens from "@/assets/tokens/ext-dev.binance.tokens.json"
import devBinanceTokens from "@/assets/tokens/dev.binance.tokens.json"

export const ZERO = new BN(0)

export function formatToCrypto(amount) {
  const conversion = new BigNumber(amount / 10 ** 18, 10)
  // show gwei if less than one
  return conversion.lt(1) && conversion.gt(0)
    ? conversion.toFormat(9)
    : conversion.toFormat(2)
}

export function parseToWei(amount: string, decimal = 18) {
  // BN is ints only
  const bigNumber = new BigNumber(amount).multipliedBy(10 ** decimal)
  return new BN(bigNumber.toFixed())
}

export const DOMAIN_NETWORK_ID = {
  1: ["loom"],
  4: ["rinkeby", "local"],
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

export const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function capitalize(s: string) {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const simpleMutations = (stateName) => ({
  [`set${capitalize(stateName)}`]: (state, payload) =>
    (state[stateName] = payload),
})

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
  if (/^0x/.test(address)) {
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

export const formatToBNBAddress = (address: string) =>
  /^0x/.test(address) ? address.replace("0x", "bnb") : address

export const formatFromBNBAddress = (address: string) =>
  address.slice(0, 3) === "bnb" ? address.replace("bnb", "0x") : address

export function getRequired<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new Error("Value required but was null " + name)
  }
  return value
}

const tokens = {
  "production": productionTokens,
  "ext-dev": extDevTokens,
  "dev": devTokens,
  "production.binance": productionBinanceTokens,
  "ext-dev.binance": extDevBinanceTokens,
  "dev.binance": devBinanceTokens,
}

export function getTokenList(tokenListId: string): TokenData[] {
  return tokens[tokenListId]
}

/**
 * @return List of loomchain addresses of tokens the user added to their Basechain Wallet.
 */
export function getWalletFromLocalStorage(walletId: string) {
  if (!Object.keys(tokens).includes(walletId)) {
    throw new Error(`Missing token list for ${walletId}!`)
  }
  let wallets = JSON.parse(localStorage.getItem("wallets")!)

  if (!wallets || !Object.keys(wallets).includes(walletId)) {
    const defaultTokens: string[] = []
    let tokenInfo = tokens[walletId].find((token) => token.symbol === "LOOM")
    if (tokenInfo) {
      defaultTokens.push(tokenInfo.plasma)
    }
    tokenInfo = tokens[walletId].find((token) => token.symbol === "ETH")
    if (tokenInfo) {
      defaultTokens.push(tokenInfo.plasma)
    }

    // add default tokens to the wallet
    if (!wallets) {
      wallets = { [walletId]: defaultTokens }
    } else {
      wallets[walletId] = defaultTokens
    }

    localStorage.setItem("wallets", JSON.stringify(wallets))
  }

  return wallets[walletId]
}

/**
 * To add the new token symbol into wallet, then update wallet in localStorage
 * @param token Token data
 * @param env Current environment
 */
export function setNewTokenToLocalStorage(token: TokenData, walletId: string) {
  const wallet = getWalletFromLocalStorage(walletId)
  // check symbol not exist in wallet
  const isExist = wallet.find((address) => token.plasma === address)
  if (!isExist) {
    wallet.push(token.plasma)
    const wallets = JSON.parse(localStorage.getItem("wallets")!)
    wallets[walletId] = wallet
    localStorage.setItem("wallets", JSON.stringify(wallets))
  }
}

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
