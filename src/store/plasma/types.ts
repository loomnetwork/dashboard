
import BN from "bn.js"
import Contract from "web3/eth/contract"
import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"
import { Client, Address, ITxMiddlewareHandler } from "loom-js"

export interface HasPlasmaState {
    plasma: PlasmaState
}

export interface PlasmaState {
    client: Client,
    address: string,
    signer: PlasmaSigner|null,
    genericAddress: string,
    appKey: {
        private: string,
        public: string,
        address: string,
    },
    erc20Addresses: {
        loom: string
        [erc20Symbol: string]: string,
    }
    balances: {
        [erc20Symbol: string]: BN,
    },
    packsContract: {
        [name: string]: Contract,
    },
    cardContract: MigratedZBGCard | null,
    cardBalance: CardDetail[],
    packBalance: PackDetail[],
    cardToTransferSelected: CardDetail | {},
    allCardsToTransferSelected: {
        edition: string
        cards: CardDetail[]
        amount: number,
    }
    packToTransferSelected: {
        type: string,
        amount: number,
    } | {}
}

export interface PackDetail {
    type: string,
    amount: number,
}

export interface CardDetail {
    id: string
    amount: number
    display_name: string
    image: string
    title: string
    variant: string
    variation: string
    mould_type: string
    element: string
    originalID: string
}

export interface TransferRequest {
    symbol: string
    tokenAmount: BN
    to: string
}

export interface PlasmaSigner {
    getAddress(): Promise<Address>
    signAsync(message: string): Promise<string>
    clientMiddleware(): ITxMiddlewareHandler[]
}
