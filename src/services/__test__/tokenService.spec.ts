import { expect } from "chai"
import { tokenService } from "../TokenService"
import Axios from "axios"
import sinon from "sinon"

import tokensList from "@/assets/tokens/production.tokens.json"

const ETH_CHAIN = "ethereum"
const PLASMA_CHAIN = "plasma"

const isAddress = (address: string) => {
  return /^(0x)[a-fA-F0-9]{40}$/.test(address)
}

describe("TokenService", () => {

  const axiosGetStub = sinon.stub(Axios, "get")
  const TOKENS_URL = "https://tokens.com/foo"

  before(() => {
    axiosGetStub.resolves({ data: tokensList })
  })

  after(() => axiosGetStub.restore())

  describe("TokenService on Production Env", () => {

    describe("load()", () => {
      it("sets tokens te the response body")
    })

    before(() => tokenService.load(TOKENS_URL))

    it("Checking symbols in TokenService", () => {
      expect(tokenService.tokens).to.be.an("array")
    })

    it("Should get TokenData that contain symbol LOOM", () => {
      const SYMBOL = "LOOM"
      expect(tokenService.getTokenbySymbol(SYMBOL)).to.include({ symbol: SYMBOL, decimals: 18 })
    })

    describe("getTokenAddressBySymbol()", () => {
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

    it("Should NOT get TokenData address with AAA symbol & Basechain", () => {
      const coinSymbol = "AAA"
      // tslint:disable-next-line: no-unused-expression
      expect(() => { tokenService.getTokenAddressBySymbol(coinSymbol, PLASMA_CHAIN) }).to.throw(Error)
    })

    it("Inserted address should be a member of all TokenSymbol array (Ethereum)", () => {
      const randIndex = Math.floor(Math.random() * tokenService.getSymbols().length)
      const symbol = tokenService.getSymbols()[randIndex]
      const address = tokenService.getTokenAddressBySymbol(symbol, ETH_CHAIN)
      expect(tokenService.tokenFromAddress(address, ETH_CHAIN)).to.be.an("object")
    })

    it("Inserted address should be a member of all TokenSymbol array (Basechain)", () => {
      const randIndex = Math.floor(Math.random() * tokenService.getSymbols().length)
      const symbol = tokenService.getSymbols()[randIndex]
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
