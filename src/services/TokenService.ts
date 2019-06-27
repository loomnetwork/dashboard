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

export interface TokenData {
  symbol: string
  ethereum: string
  plasma: string
  decimals: number
}

class TokenService {
  baseURL: string = ""
  symbols: TokenData[] = []

  /**
   * should call this method after service class created
   */
  async setBaseURL(url: string) {
    this.baseURL = url
    const result = await axios.get(this.baseURL)
    this.symbols = result.data.tokens.map(
      (data): TokenData => ({
        symbol: data.symbol,
        ethereum: data.address.toLowerCase(),
        plasma: data.plasma_addr.toLowerCase(),
        decimals: data.decimal,
      }),
    )
    console.log("tokens registery loaded")
  }
  /**
   *
   * @param coinSymbol like BNB ETH LOOM... etc
   * @param chain address from plasma | ethereum
   */
  getTokenAddressBySymbol(
    coinSymbol: string,
    chain: "ethereum" | "plasma",
  ): string {
    const data = this.getTokenbySymbol(coinSymbol)
    return data[chain.toLowerCase()]
  }

  /**
   * Return list of token symbol
   */
  getAllTokenSymbol() {
    const symbolList = this.symbols.map((token) => token.symbol)
    return symbolList
  }
  /**
   * Return token object
   * @param coinSymbol
   */
  getTokenbySymbol(coinSymbol: string): TokenData {
    const data = this.symbols.find((token) => token.symbol === coinSymbol)
    if (data === undefined) {
      throw new Error("Unknown token " + coinSymbol)
    }
    return data
  }

  tokenFromAddress(
    address: string,
    chain: "plasma" | "ethereum",
  ): TokenData | null {
    const info = this.symbols.find((token) => token[chain] === address.toLocaleLowerCase())
    if (info === undefined) {
      console.warn(
        `No knwon token contract matches address ${address} on ${chain}`,
      )
      return null
    } else {
      return info
    }
  }
}

export const tokenService = new TokenService()
