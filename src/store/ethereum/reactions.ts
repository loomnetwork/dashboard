import { Store } from "vuex"
import { ethereumModule } from "."
import { DashboardState } from "@/types"
import { tokenService } from "@/services/TokenService"

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

    ethereumModule.initUserData(address)
    ethereumModule.pollLastBlockNumber()
    ethereumModule.initERC20("LOOM")

    if (tokenService.get(store.state.ethereum.nativeTokenSymbol)) {
      ethereumModule.refreshBalance(store.state.ethereum.nativeTokenSymbol)
    }
  }

}
