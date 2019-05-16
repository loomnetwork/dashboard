
import BN from "bn.js"
import { Client } from "loom-js"

export interface HasPlasmaState {
    plasma: PlasmaState
}

export interface PlasmaState {
    client: Client|null,
    address: string,
    balances: {
        [erc20Symbol: string]: BN,
    }
}

export interface TransferRequest {
    symbol: string
    tokenAmount: BN
    to: string
}
