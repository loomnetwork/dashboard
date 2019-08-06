import { expect } from "chai"
import { tokenService, TokenData } from "../TokenService"
import devConfig from "../../config/dev"
import prodConfig from "../../config/production"
import localConfig from "../../config/local"
import stageConfig from "../../config/stage"

const coinUrl = {
  dev: devConfig.coinDataUrl,
  production: prodConfig.coinDataUrl,
  local: localConfig.coinDataUrl,
  stage: stageConfig.coinDataUrl,
}

const ETH_CHAIN = "ethereum"
const PLASMA_CHAIN = "plasma"

const isAddress = (address: string) => {
  return /^(0x)[a-fA-F0-9]{40}$/.test(address)
}

const isString = (str: string) => {
  return typeof (str) === "string" && str.length > 0
}

describe("TokenService", () => {

  describe("TokenService on Production Env", () => {
    before(async () => {
      await tokenService.setBaseURL(coinUrl.production)
    })

    it("Checking symbols in TokenService", () => {
      expect(tokenService.symbols).to.be.an("array")
    })
    it("Should get an array of symbol from TokenService", () => {
      // tslint:disable-next-line: no-unused-expression
      expect(tokenService.getAllTokenSymbol().every((symbol) => isString(symbol))).to.be.true
    })
    it("Should get TokenData that contain symbol LOOM", () => {
      const SYMBOL = "LOOM"
      expect(tokenService.getTokenbySymbol(SYMBOL)).to.include({ symbol: SYMBOL, decimals: 18 })
    })
    it("Should get TokenData that contain symbol ETH", () => {
      const eth_token: TokenData = {
        symbol: "ETH",
        ethereum: "0x".padEnd(42, "0"),
        plasma: "0x".padEnd(42, "0"),
        binance: "",
        decimals: 18,
      }
      const actualToken = tokenService.getTokenbySymbol(eth_token.symbol)
      expect(actualToken).to.include(eth_token)
    })

    it("Should get TokenData address with LOOM symbol & Ethereum chain", () => {
      const coinSymbol = "LOOM"
      const loom_address = tokenService.getTokenAddressBySymbol(coinSymbol, ETH_CHAIN)
      // tslint:disable-next-line: no-unused-expression
      expect(isAddress(loom_address)).to.be.true
    })

    it("Should get TokenData address with LOOM symbol & Plasma chain", () => {
      const coinSymbol = "LOOM"
      const loom_address = tokenService.getTokenAddressBySymbol(coinSymbol, PLASMA_CHAIN)
      // tslint:disable-next-line: no-unused-expression
      expect(isAddress(loom_address)).to.be.true
    })

    it("Should NOT TokenData address with AAA symbol", () => {
      const coinSymbol = "AAA"
      expect(() => { tokenService.getTokenbySymbol(coinSymbol) }).to.throw(Error)
    })

    it("Should NOT get TokenData address with AAA symbol & Ethereum chain", () => {
      const coinSymbol = "AAA"
      // tslint:disable-next-line: no-unused-expression
      expect(() => { tokenService.getTokenAddressBySymbol(coinSymbol, ETH_CHAIN) }).to.throw(Error)
    })

    it("Should NOT get TokenData address with AAA symbol & Plasmachain", () => {
      const coinSymbol = "AAA"
      // tslint:disable-next-line: no-unused-expression
      expect(() => { tokenService.getTokenAddressBySymbol(coinSymbol, PLASMA_CHAIN) }).to.throw(Error)
    })

    it("Inserted address should be a member of all TokenSymbol array (Ethereum)", () => {
      const randIndex = Math.floor(Math.random() * tokenService.getAllTokenSymbol().length)
      const symbol = tokenService.getAllTokenSymbol()[randIndex]
      const address = tokenService.getTokenAddressBySymbol(symbol, ETH_CHAIN)
      expect(tokenService.tokenFromAddress(address, ETH_CHAIN)).to.be.an("object")
    })

    it("Inserted address should be a member of all TokenSymbol array (Plasmachain)", () => {
      const randIndex = Math.floor(Math.random() * tokenService.getAllTokenSymbol().length)
      const symbol = tokenService.getAllTokenSymbol()[randIndex]
      const address = tokenService.getTokenAddressBySymbol(symbol, PLASMA_CHAIN)
      expect(tokenService.tokenFromAddress(address, PLASMA_CHAIN)).to.be.an("object")
    })

    it("Inserted invalid address should be NULL (PlasmaChain)", () => {
      const invalidAddress = "0x00"
      // tslint:disable-next-line: no-unused-expression
      expect(tokenService.tokenFromAddress(invalidAddress, PLASMA_CHAIN)).to.be.null
    })

    it("Inserted invalid address should be NULL (Ethereum Chain)", () => {
      const invalidAddress = "0x00"
      // tslint:disable-next-line: no-unused-expression
      expect(tokenService.tokenFromAddress(invalidAddress, ETH_CHAIN)).to.be.null
    })
  })

})
