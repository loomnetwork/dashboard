import { Store } from "vuex"
import { ethereumModule } from "."
import { DashboardState } from "@/types"

export function ethereumReactions(store: Store<DashboardState>) {
  store.watch((s) => s.ethereum.address, onAddressChange)

  function onAddressChange(address, old) {
    // store.state.ethereum.provider!.(old)
    if (address === "") {
      // thereumModule.web3.removeAllListeners ethereumModule.disconnect()
      // should reset contracts
      return
    }
    ethereumModule.initERC20("LOOM")
    ethereumModule.refreshBalance("ETH")
    ethereumModule.web3.eth.getBlockNumber().then((blockNumber: number) => {
      ethereumModule.setBlockNumber(blockNumber)
      ethereumModule.web3.eth.subscribe("newBlockHeaders", (error, event) => {
        if (!error) {
          ethereumModule.setBlockNumber(event.number)
          if (localStorage.getItem("latestWithdrawalBlock")) {
            const value = localStorage.getItem("latestWithdrawalBlock")
            // @ts-ignore
            const block = JSON.parse(value)
            console.log("Remaining blocks: ", event.number - (block + 15))
          }
          return
        }
        console.warn("Error parsing blocks: ", error.message)
      })
    })
  }
}
