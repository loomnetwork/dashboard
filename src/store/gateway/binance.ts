import BN from "bn.js"
import Web3 from "web3"
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import { timer } from "rxjs"
// import { BinanceLoomCoinTransferGateway } from "loom-js/dist/contracts"
import { PlasmaGatewayAdapter } from "./types"
import { Address } from "loom-js"

/**
 * temporary stub for BinanceLoomCoinTransferGateway
 */
class BinanceLoomCoinTransferGateway {
  async withdrawLoomCoinAsync(amount: BN, recipient: Address): Promise<void> {
    await timer(2000).toPromise()
  }
  async withdrawalReceipt() {
    await timer(2000).toPromise()
    return null
  }
}

export class BinanceLoomGatewayAdapter implements PlasmaGatewayAdapter {
  chain = "binance"
  token = "LOOM"
  constructor(
    private vmc: ValidatorManagerContract,
    readonly contract: BinanceLoomCoinTransferGateway,
    readonly binanceRecipient: Address,
  ) {}
  deposit(amount: BN, binanceRecipient: Address) {
    // no deposit
    return
  }
  withdraw(amount: BN) {
    return this.contract.withdrawLoomCoinAsync(amount, this.binanceRecipient)
  }
  withdrawalReceipt() {
    return this.contract.withdrawalReceipt()
  }
}
