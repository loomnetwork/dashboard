import { IWithdrawalReceipt, IUnclaimedToken } from "loom-js/dist/contracts/transfer-gateway"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState } from "../plasma/types"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { Address } from "loom-js"

// Gateway module depoends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
    gateway: GatewayState
}

export interface GatewayState {
    mapping: IAddressMapping|null,
    pendingTransaction: any,
    pendingReceipt: IWithdrawalReceipt|null
    unclaimedTokens: IUnclaimedToken[]
}
