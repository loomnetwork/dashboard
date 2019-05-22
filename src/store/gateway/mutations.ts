import { GatewayState } from "./types"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt, IUnclaimedToken } from "loom-js/dist/contracts/transfer-gateway"

export function setMapping(state: GatewayState, mapping: IAddressMapping) {
    state.mapping = mapping
}
export function setPendingTx(state: GatewayState, tx: {type: string, info: any}) {
    state.pendingTransaction = tx
}
export function setPendingReceipt(state: GatewayState, receipt: IWithdrawalReceipt) {
    state.pendingReceipt = receipt
}

export function setUnclaimedTokens(state: GatewayState, unclaimedTokens: IUnclaimedToken[]) {
    state.unclaimedTokens = unclaimedTokens
}

