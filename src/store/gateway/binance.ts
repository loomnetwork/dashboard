import BN from "bn.js"
import Web3 from "web3"
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import { timer } from "rxjs"
import { PlasmaGatewayAdapter } from "./plasma"
import { BinanceLoomCoinTransferGateway } from "loom-js/dist/contracts"

class BinanceLoomGatewayAdapter implements PlasmaGatewayAdapter {
    constructor(
        private vmc: ValidatorManagerContract,
        readonly contract: BinanceLoomCoinTransferGateway,
        readonly tokenAddress: string,
        readonly token: string,
    ) {}
    deposit(amount: BN, address: string) {
        return timer(2000).toPromise()
    }
    withdraw() {
        return timer(2000).toPromise()
    }
    async withdrawalReceipt() {
        await timer(2000).toPromise()
        return null
    }
}

// let instance: BinanceGateways
export function init() {
    // instance = new BinanceGateways()
    return timer(2000).toPromise()
}

class BinanceGateways {

  add(token: string) {
    switch (token) {
      case "LOOM" :
        break
    }
  }
}
