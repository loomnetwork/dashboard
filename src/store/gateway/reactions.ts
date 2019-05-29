import { HasGatewayState, EthPlasmSigner } from "./types"
import { Store } from "vuex"
import {
  gatewayModule,
  createEthereumContracts,
  createPlasmaContracts,
} from "."
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { plasmaModule } from "../plasma"
import { Provider } from "ethers/providers"

export function ethGatewayPlugin(store: Store<HasGatewayState>) {
  store.watch((s) => s.ethereum.address, ethereumAddressSet)

  // When we have a mapping
  // set the identity on the plasma module
  // create ethereum and plasma gateway contracts
  store.watch(
    (s) => s.gateway.mapping,
    (mapping) => {
      if (mapping === null || mapping.to.isEmpty()) {
        // todo destroy anything that needs to be disposed of
        return
      }
      setPlasmaAccount(mapping)
      createEthereumContracts(store.state.ethereum.provider!)
      createPlasmaContracts(store.state.plasma.client, mapping.from)
    },
  )

  async function ethereumAddressSet(newAddress) {
    console.log("eth address set", newAddress)
    await gatewayModule.loadMapping(newAddress)
  }

  function setPlasmaAccount(mapping: IAddressMapping | null) {
    console.log("setPlasmaIdy", mapping)

    // do nothing if mapping is incomplete
    if (mapping === null || mapping.from.isEmpty() || mapping.to.isEmpty()) {
      return
    }
    const state = store.state
    console.log("set plasma address and signer if any")
    // assuming from is always ethereum
    state.plasma.address = mapping.to.toString()
    if (state.ethereum.signer) {
      plasmaModule.changeIdentity({
        signer: new EthPlasmSigner(state.ethereum.signer!),
        address: mapping.to.local.toString(),
      })
    } else {
      plasmaModule.changeIdentity({
        signer: null,
        address: mapping.to.local.toString(),
      })
    }
  }
}
