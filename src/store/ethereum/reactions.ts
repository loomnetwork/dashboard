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
      if (localStorage.getItem("latestWithdrawalBlock")) {
        const value = localStorage.getItem("latestWithdrawalBlock")
        // @ts-ignore
        const block = JSON.parse(value)
        console.log("Setting the latest withdrawal block", block)
        ethereumModule.setLatestWithdrawalBlock(block)
      }
      ethereumModule.web3.eth.subscribe("newBlockHeaders", (error, event) => {
        if (!error) {
          console.log("Setting the latest block", event.number)
          ethereumModule.setBlockNumber(event.number)
        }
        console.warn("Error parsing blocks: ", error)
      })
    })
  }
}
