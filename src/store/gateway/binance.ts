import BN from "bn.js"
import Web3 from "web3"
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"

interface BinanceGatewayAdapter {
    token: string
}

class ERC20GatewayAdapter implements BinanceGatewayAdapter {
    constructor(
        private vmc: ValidatorManagerContract,
        readonly contract: ERC20Gateway_v2,
        readonly tokenAddress: string,
        readonly token: string,
    ) {}
    deposit(amount: BN, address: string) {
        console.warn("ERC20GatewayAdapter-deposit !!")
    }
    withdraw() {
        console.warn("ERC20GatewayAdapter-withdraw !!")
    }
}

export function init() {
    console.warn("init binance!!")
}
