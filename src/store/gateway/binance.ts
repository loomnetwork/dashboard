import BN from "bn.js"
import Web3 from "web3"
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import { timer } from "rxjs"
// import { BinanceLoomCoinTransferGateway } from "loom-js/dist/contracts"
import { PlasmaGatewayAdapter } from "./types"
import { Address, Contract } from "loom-js"
import { BinanceTransferGateway } from "loom-js/dist/contracts"
import { tokenService } from "@/services/TokenService"

import debug from "debug"

const log = debug("dash.gateway.binance")

export class BinanceGatewayAdapter implements PlasmaGatewayAdapter {
  chain = "binance"
  token = "BNB" // tmp
  constructor(
    public readonly contract: BinanceTransferGateway,
    public readonly fee: {
      token: "BNB"
      amount: BN,
    },
  ) { }
  deposit() {
    console.warn("go to binance.com to make deposits from binance")
    // no deposit
    return
  }
  withdraw(amount: BN, recipient: Address) {
    const plasmaTokenAddrStr = tokenService.getTokenAddressBySymbol(this.token, "plasma")
    // @ts-ignore
    const chainId = this.contract._client.chainId
    const plasmaTokenAddr = Address.fromString(`${chainId}:${plasmaTokenAddrStr}`)

    return this.contract.withdrawToken(amount, plasmaTokenAddr, recipient)
  }
  withdrawalReceipt() {
    return this.contract.withdrawalReceiptAsync(this.contract.caller)
  }
}
