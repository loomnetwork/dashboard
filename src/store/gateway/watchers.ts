import { HasGatewayState } from "./types"
import { Store } from "vuex"
import { gatewayModule } from "."

export function ethGatewayPluging(store: Store<HasGatewayState>) {
    store.watch(
        (s) => s.ethereum.address,
        ethereumAddressSet,
    )

    function ethereumAddressSet(newAddress) {
        gatewayModule.checkMapping(newAddress)
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
