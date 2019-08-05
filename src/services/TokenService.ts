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
  binance: string
  decimals: number
}

class TokenService {
  env: string = ""
  baseURL: string = ""
  symbols: TokenData[] = []

  setEnv(env: string) {
    this.env = env
  }

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
        binance: "",
      }),
    )

    // hack until it's updated in loomauth
    const BNB = this.symbols.find((data) => data.symbol === "BNB")!
    BNB.decimals = 8
    // disable ethereun
    BNB.ethereum = ""

    // keep OLD_BNB until people with stuck receipts on ethereum gateway
    // complete their withdrawals
    const OLD_BNB = { ...BNB }
    OLD_BNB.symbol = "ETHBNB"
    this.symbols.push(OLD_BNB)

    // Hack BNB data until we set the right vqlues in loomauth token data
    switch (BNB.plasma) {
      // asia1
      case "0xb6f5558ed8fd604dcda28514c4fb39af935c48e9":
        BNB.binance = "tbnb14sa7gnlalxd0e336clc0ltgke6e6hdanyl6pqq"
        break
      // us1
      case "0x6080fcced27a1e0bf15e5e3ac32e3755e19bd4d9":
        BNB.binance = "tbnb1kzsnp502agsuqw5e8kdh0v2csg4elgaxc4gvxz"
        break
      // prod (loomaauth tokens endpoint still not up to date)
      default:
        BNB.plasma = "0xf37d4c3d2eea80a6b7c45d77f3093d797e3da124"
        BNB.binance = "bnb17mxq8p5jmw27dtt6s92fd35yltdml6snw3r98t"
        break
    }

    if (this.env === "ext-dev") {
      const LOOM = this.symbols.find((data) => data.symbol === "LOOM")
      LOOM!.ethereum = "0x493640B5BEFB0962CE0932653987C41aA3608bd0"
    }

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
    return Object.assign({}, data)
  }

  tokenFromAddress(
    address: string,
    chain: "plasma" | "ethereum",
  ): TokenData | null {
    const info = this.symbols.find((token) => token[chain] === address.toLocaleLowerCase())
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
