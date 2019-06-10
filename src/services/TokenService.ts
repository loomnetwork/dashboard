/**
 * @module loom-dashboard.tokens
 *
 * Service that returns information about tokens.
 *
 * Example enttity return by the API
 * ```
 * {
 *  "tokens": [
 *     {
 *        "symbol": "PAX",
 *        "address": "0xccf6557c4899920604c549f9d3eda1bc990c077f",
 *        "token_type": "stable",
 *        "price": {
 *            "5": 999,
 *            "25": 4499,
 *            "100": 15999
 *        },
 *        "unit_per_cent": 100,
 *        "plasma_addr": "0x56c80de2eafe0086d690b87082472548f7bb917f",
 *        "decimal": 18
 *      }
 *  ]
 * }
 * ```
 */

import axios from "axios"

interface TokenData {
  symbol: string
  address: string
  plasma_addr: string
  decimal: number
}

class TokenService {
  baseURL: string = ""
  symbols: TokenData[] = []

  constructor() {
    // this.baseURL = "https://stage-auth.loom.games/wallet/tokens" // need to set base url for different env
    // this.symbols = []
    // this.init()
  }

  // async init() {
  //   const result = await axios.get(this.baseURL)
  //   this.symbols = result.data.tokens
  // }

  /**
   * should call this method after service class created
   */
  async setBaseURL(url: string) {
    this.baseURL = url
    const result = await axios.get(this.baseURL)
    this.symbols = result.data.tokens as TokenData[]
  }
  /**
   *
   * @param coinSymbol like BNB ETH LOOM... etc
   * @param chain address from plasma | ethereum
   */
  getTokenAddressBySymbol(coinSymbol: string, chain: string) {
    const data = this.symbols.find((token) => {
      return token.symbol === coinSymbol
    })
    if (data === undefined) {
      throw new Error("Unknown token " + coinSymbol)
    }
    switch (chain.toLowerCase()) {
      case "plasma":
        return data.plasma_addr
      case "ethereum":
        return data.address
      default:
        throw new Error("Unknown chain " + chain)
    }
  }

  /**
   * Return list of token symbol
   */
  getAllTokenSymbol() {
    const symbolList = this.symbols.map((token) => token.symbol)
    return symbolList
  }
}

export default new TokenService()
