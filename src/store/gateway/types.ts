import { IWithdrawalReceipt, IUnclaimedToken } from "loom-js/dist/contracts/transfer-gateway"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState, PlasmaSigner } from "../plasma/types"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { Address, NonceTxMiddleware, SignedEthTxMiddleware, LocalAddress } from "loom-js"
import { ethers } from "ethers"

// Gateway module depoends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
    gateway: GatewayState
}

export interface GatewayState {
    mapping: IAddressMapping|null,
    loom: Gateway,
    main: Gateway,
}

export class EthPlasmSigner implements PlasmaSigner {
    readonly chain = "eth"
    constructor(private signer: ethers.Signer) {}
    getAddress() {
        return this.signer.getAddress()
    }
    signAsync(message) {
        return this.signer.signMessage(message)
    }
    async configureClient(client) {
        const ethAddress = await this.getAddress()
        const callerAddress = new Address("eth", LocalAddress.fromHexString(ethAddress))
        client.txMiddleware = [
            new NonceTxMiddleware(callerAddress, client),
            // @ts-ignore
            new SignedEthTxMiddleware(this.signer),
          ]
    }
}

interface Gateway {
    pendingTransaction: any,
    pendingReceipt: IWithdrawalReceipt|null
    unclaimedTokens: IUnclaimedToken[],
    address: string,
}