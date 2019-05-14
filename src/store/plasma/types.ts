
import BN from "bn.js"
import { Client } from "loom-js"
import Contract from 'web3/eth/contract';

export interface HasPlasmaState {
    plasma: PlasmaState
}

export interface PlasmaState {
    client: Client|null,
    balances: {
        [erc20Symbol:string]:BN
    },
    cardContract: {
        [name: string]: Contract
    }
}
