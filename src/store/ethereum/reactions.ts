import { Store } from "vuex"
import { ethereumModule } from "."
import { DashboardState } from "@/types"

export function ethereumReactions(store: Store<DashboardState>) {
  store.watch((s) => s.ethereum.address, onAddressChange)

  // TODO move this to gateway module
  function onAddressChange(address: string) {
    // store.state.ethereum.provider!.(old)
    if (address === "") {
      // thereumModule.web3.removeAllListeners ethereumModule.disconnect()
      // should reset contracts
      return
    }
    ethereumModule.initERC20("LOOM")
    ethereumModule.refreshBalance("ETH")
    ethereumModule.pollLastBlockNumber()
  }

}
