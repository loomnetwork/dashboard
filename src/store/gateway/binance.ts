import BN from "bn.js"
import Web3 from "web3"
import { timer } from "rxjs"
// import { BinanceLoomCoinTransferGateway } from "loom-js/dist/contracts"
import { PlasmaGatewayAdapter } from "./types"
import { Address, Contract } from "loom-js"
import { BinanceTransferGateway } from "loom-js/dist/contracts"
import { tokenService } from "@/services/TokenService"

import debug from "debug"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"

const log = debug("dash.gateway.binance")

export class BinanceGatewayAdapter implements PlasmaGatewayAdapter {
  chain = "binance"
  token: string
  constructor(
    public readonly contract: BinanceTransferGateway,
    readonly mapping: IAddressMapping,
    public readonly fee: {
      amount: BN,
      token: "BNB",
    },
    token: string,
  ) {
    this.token = token
  }
  deposit() {
    console.warn("go to binance.com to make deposits from binance")
    // no deposit
    return
  }
  withdraw(amount: BN, recipient: Address) {
    log("withdraw", amount.toString(), recipient)
    const plasmaTokenAddrStr = tokenService.getTokenAddressBySymbol(this.token, "plasma")
    // @ts-ignore
    const chainId = this.contract._client.chainId
    const plasmaTokenAddr = Address.fromString(`${chainId}:${plasmaTokenAddrStr}`)
    if (this.token === "LOOM") {
      return this.contract.withdrawLoomAsync(amount, recipient)
    } else {
      return this.contract.withdrawTokenAsync(amount, plasmaTokenAddr, recipient)
    }
  }
  withdrawalReceipt() {
    return this.contract.withdrawalReceiptAsync(this.mapping.to)
  }
  async getLocalAccountInfo(owner: Address) {
    return this.contract.getLocalAccountInfoAsync(owner)
  }
  async getGatewayState() {
    return this.contract.getStateAsync()
  }

}
