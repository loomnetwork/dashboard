import { HasGatewayState, EthPlasmSigner } from "./types"
import { Store } from "vuex"
import { gatewayModule } from "."
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { plasmaModule } from "../plasma"
import { Provider } from "ethers/providers"

import * as EthereumGateways from "./ethereum"
import * as PlasmaGateways from "./plasma"
import { ethereumModule } from "../ethereum"

export function ethGatewayPlugin(store: Store<HasGatewayState>) {
  store.watch(
    (s) => s.ethereum.address,
    (newAddress) => gatewayModule.loadMapping(newAddress),
  )

  // When we have a mapping
  // set the identity on the plasma module
  // reset ethereum and plasma gateway services
  store.watch(
    (s) => s.gateway.mapping,
    async (mapping) => {
      if (mapping === null || mapping.to.isEmpty()) {
        // todo destroy anything that needs to be disposed of
        return
      }
      await setPlasmaAccount(mapping)

      EthereumGateways.init(ethereumModule.web3)
      PlasmaGateways.init(
        plasmaModule.client,
        plasmaModule.provider,
        mapping.from,
      )
    },
  )

  function setPlasmaAccount(mapping: IAddressMapping | null) {
    console.log("setPlasmaIdy", mapping)
    const plasmaAddress =
      mapping === null || mapping.to.isEmpty()
        ? ""
        : mapping.to.local.toString()

    const state = store.state
    console.log("set plasma address and signer if any")
    // assuming from is always ethereum
    const signer =
      state.ethereum.signer !== null
        ? new EthPlasmSigner(state.ethereum.signer!)
        : null

    plasmaModule.changeIdentity({ signer, address: plasmaAddress })
  }
}
