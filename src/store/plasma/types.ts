
import BN from "bn.js"
import { Client } from "loom-js"
import Contract from "web3/eth/contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"

export interface HasPlasmaState {
    plasma: PlasmaState
}

export interface PlasmaState {
    client: Client|null,
    balances: {
        [erc20Symbol: string]: BN,
    },
    packsContract: {
        [name: string]: Contract,
    },
    cardContract: MigratedZBGCard | null,
    cardBalance: CardBalance[],
}

export interface CardBalance {
    id: string
    amount: number
}
