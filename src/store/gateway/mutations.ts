import { GatewayState } from "./types"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { IWithdrawalReceipt, IUnclaimedToken } from "loom-js/dist/contracts/transfer-gateway"

export function setMapping(state: GatewayState, mapping: IAddressMapping) {
    state.mapping = mapping
}

