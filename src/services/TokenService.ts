import axios from "axios"

class TokenService {
  baseURL: string
  symbols: any[]
  constructor() {
    this.baseURL = "https://stage-auth.loom.games/wallet/tokens" // need to set base url for different env
    this.symbols = []
    this.init()
  }

  /**
   * should call this method after service class created
   */
  async init() {
    const result = await axios.get(this.baseURL)
    this.symbols = result.data.tokens
  }

  setBaseURL(url: string) {
    this.baseURL = url
  }
  /**
   * 
   * @param coinSymbol like BNB, LOOM, ETH
   */
  getTokenAddressBySymbol(coinSymbol: string) {
    const address = this.symbols.filter((token) => {
      return token.symbol === coinSymbol
    })
    return address[0].plasma_addr
  }

  /**
   * Return list of token symbol
   */
  getAllTokenSymbol() {
    const symbolList = this.symbols.map((token) => token.symbol)
    return symbolList
  }
}

export default TokenService
