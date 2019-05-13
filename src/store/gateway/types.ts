import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState } from "../plasma/types"

// Gateway module depoends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
    gateway: GatewayState
}

export interface GatewayState {
    pendingTransaction: any,
    pendingReceipt: IWithdrawalReceipt|null
}
