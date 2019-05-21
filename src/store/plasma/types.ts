
import BN from "bn.js"
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
    }
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
