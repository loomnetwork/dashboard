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
  token = "BNB"
  constructor(
    public readonly contract: BinanceTransferGateway,
  ) { }
  deposit() {
    // no deposit
    return
  }
  withdraw(amount: BN, recipient: Address) {
    const plasmaTokenAddrStr = tokenService.getTokenAddressBySymbol(this.token, "plasma")
    const plasmaTokenAddr = Address.fromString(`default:${plasmaTokenAddrStr}`)

    log("binance.withdraw", amount.toString(), plasmaTokenAddr.toString())
    log("recipient", recipient.toString())
    log("caller", this.contract.caller.toString())

    return this.contract.withdrawToken(amount, plasmaTokenAddr, recipient)
  }
  withdrawalReceipt() {
    return this.contract.withdrawalReceiptAsync(this.contract.caller)
  }
}
