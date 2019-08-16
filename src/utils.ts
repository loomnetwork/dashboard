import BN from "bn.js"
import BigNumber from "bignumber.js"
import Cards from "./data/cards.json"
import CardDetails from "./data/cardDetail.json"
import { TokenData, tokenService } from "./services/TokenService"
import { store } from "./store"
import productionTokens from "@/assets/tokens/production.tokens.json"
import extDevTokens from "@/assets/tokens/ext-dev.tokens.json"
import stageTokens from "@/assets/tokens/stage.tokens.json"
import devTokens from "@/assets/tokens/dev.tokens.json"

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
  4: ["rinkeby", "stage", "local"],
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

/**
 * Return list of token symbol from localStorage
 */
export function getWalletFromLocalStorage() {
  const env = store.state.env
  let wallet = JSON.parse(localStorage.getItem("wallet")!) // Get wallet from localStorage

  if (!wallet || !Object.keys(wallet).includes(env)) {
    if (wallet.includes("LOOM", "ETH")) {
      wallet = {}
    }

    let plasmaLoomAddr
    let plasmaEthAddr

    switch (env) {
      case "production":
        plasmaLoomAddr = productionTokens.find((token) => token.symbol === "LOOM")!.plasma
        plasmaEthAddr = productionTokens.find((token) => token.symbol === "ETH")!.plasma
        break
      case "ext-dev":
        plasmaLoomAddr = extDevTokens.find((token) => token.symbol === "LOOM")!.plasma
        plasmaEthAddr = extDevTokens.find((token) => token.symbol === "ETH")!.plasma
        break
      case "stage":
        plasmaLoomAddr = stageTokens.find((token) => token.symbol === "LOOM")!.plasma
        plasmaEthAddr = stageTokens.find((token) => token.symbol === "ETH")!.plasma
        break
      case "dev":
        plasmaLoomAddr = devTokens.find((token) => token.symbol === "LOOM")!.plasma
        plasmaEthAddr = devTokens.find((token) => token.symbol === "ETH")!.plasma
        break
      default:
        console.error("Unknown env " + env)
        break
    }

    // Create default wallet
    if (!wallet) {
      wallet = { [env]: [plasmaLoomAddr, plasmaEthAddr] }
    } else {
      wallet[env] = [plasmaLoomAddr, plasmaEthAddr]
    }

    localStorage.setItem("wallet", JSON.stringify(wallet)) // set wallet to localStorage
  }

  return wallet
}

/**
 * To add the new token symbol into wallet, then update wallet in localStorage
 * @param newSymbol Token symbol
 */
export function setNewTokenToLocalStorage(newSymbol: TokenData) {
  const env = store.state.env
  const wallet = getWalletFromLocalStorage()
  // check symbol not exist in wallet
  const isExist = wallet[env].find((symbol) => newSymbol.plasma === symbol)
  if (!isExist) {
    wallet[env].push(newSymbol.plasma)
  }
  localStorage.setItem("wallet", JSON.stringify(wallet))
}

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function detectedWallet() {
  if ("imToken" in window ||
    // @ts-ignore
    ("ethereum" in window && window.ethereum.isImToken)
  ) return "imToken"

  // @ts-ignore
  const web3 = window.web3
  if (!web3) return ""

  if (web3.isCobo) return "cobo"

  if (web3.currentProvider.isTrust) return "trust"

  if (web3.currentProvider.isGoWallet) return "goWallet"

  if (web3.currentProvider.isAlphaWallet) return "alphaWallet"

  if (web3.currentProvider.isStatus) return "status"

  if (web3.currentProvider.isToshi) return "coinbase"

  if ("__CIPHER__" in window) return "cipher"

  if (web3.currentProvider.isMetaMask) return "metamask"

  return ""
}
