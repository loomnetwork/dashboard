import { HasGatewayState } from "./types"
import { Store } from "vuex"
import { gatewayModule } from "."
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { plasmaModule } from "../plasma"

export function ethGatewayPluging(store: Store<HasGatewayState>) {
    store.watch(
        (s) => s.ethereum.address,
        ethereumAddressSet,
    )

    function ethereumAddressSet(newAddress) {
        gatewayModule.checkMapping(newAddress)
    }

    store.watch(
        (s) => s.gateway.mapping,
        setPlasmaId,
    )

    function setPlasmaId(mapping: IAddressMapping|null) {
        // do nothing if mapping is incomplete
        if (mapping === null || mapping.from.isEmpty() || mapping.from.isEmpty()) {
            return
        }
        // assuming from is always ethereum
        plasmaModule
    }
}

function gatewayModulePlugin(store: Store<HasGatewayState>) {

    store.watch(
        (state) => store.state.gateway.pendingReceipt,
        (value, old) => {
            console.log("pending receipt")
        },
    )
}
