import { Store } from "vuex"
import { ethereumModule } from "."
import { DashboardState } from "@/types"
import { dposModule } from "@/dpos/store"
import { gatewayModule } from "../gateway"

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

    trackUser(address)
    ethereumModule.initUserData(address)
    ethereumModule.pollLastBlockNumber()
    ethereumModule.initERC20("LOOM")
    ethereumModule.refreshBalance("ETH")

  }

}

function trackUser(address: string) {
  // @ts-ignore
  if (typeof analytics === "undefined") return
  const ref = dposModule.getReferrer()
  // @ts-ignore
  analytics.identify(address, {
    provider: ref,
  })
}
