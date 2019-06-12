import BN from "bn.js"
import Web3 from "web3"
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import { timer } from "rxjs"

class ERC20GatewayAdapter {
    constructor(
        private vmc: ValidatorManagerContract,
        readonly contract: ERC20Gateway_v2,
        readonly tokenAddress: string,
        readonly token: string,
    ) {}
    deposit(amount: BN, address: string) {
        return timer(2000).toPromise()
    }
    withdraw() {
        return timer(2000).toPromise()
    }
}

export function init() {
    return timer(2000).toPromise()
}
