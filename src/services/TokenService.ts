/**
 * @module loom-dashboard.tokens
 *
 * Service that returns information about tokens.
 */

import axios from "axios"

export interface TokenData {
  symbol: string
  ethereum: string
  plasma: string
  binance: string
  decimals: number
}

const ETHBNB: TokenData = Object.freeze({
  symbol: "ETHBNB",
  decimals: 18,
  ethereum: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
  plasma: "0xcf2851b1ad63d093238ea296524be8d7cd920e0b",
  binance: "",
})

class TokenService {
  tokens: TokenData[] = []

  get symbols() {
    return this.tokens
  }

  /**
   * should call this method after service class created
   * @param url to tokens json
   * json is expected tp be  TokenData[]
   */
  async load(url: string) {
    const result = await axios.get(url)
    this.tokens = result.data.map((t) => Object.freeze(t))
    // temporary (gateway until BNB receipts are cleared on ethereum TG)
    this.tokens.push(ETHBNB)
  }

  getAddress(
    symbol: string,
    chain: "ethereum" | "plasma" | "binance",
  ): string {
    const data = this.getTokenbySymbol(symbol)
    return data[chain]
  }

  /**
   *
   * @param coinSymbol like BNB ETH LOOM... etc
   * @param chain address from plasma | ethereum
   */
  getTokenAddressBySymbol(
    symbol: string,
    chain: "ethereum" | "plasma" | "binance",
  ): string {
    return this.getAddress(symbol, chain)
  }

  /**
   * Return list of token symbol
   */
  getSymbols(): string[] {
    return this.tokens.map((token) => token.symbol)
  }
  /**
   * Return token object
   * @param coinSymbol
   */
  getTokenbySymbol(symbol: string): TokenData {
    const data = this.get(symbol)
    if (data === undefined) {
      throw new Error("Unknown token " + symbol)
    }
    return data
  }

  get(symbol: string): TokenData | undefined {
    return this.tokens.find((token) => token.symbol === symbol)
  }

  tokenFromAddress(
    address: string,
    chain: "plasma" | "ethereum",
  ): TokenData | null {
    const info = this.tokens.find((token) => token[chain] === address.toLocaleLowerCase())
    if (info === undefined) {
      console.warn(
        `No known token contract matches address ${address} on ${chain}`,
      )
      return null
    } else {
      return info
    }
  }
}

export const tokenService = new TokenService()
