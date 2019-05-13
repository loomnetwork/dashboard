
import BN from "bn.js"
import { Client } from "loom-js"

export interface HasPlasmaState {
    plasma: PlasmaState
}

export interface PlasmaState {
    client: Client|null,
    balances: {
        [erc20Symbol: string]: BN,
    }
}
