import { Store } from "vuex"
import { HasEthereumState } from "./types"
import { Provider } from "ethers/providers"
import { ethers } from "ethers"
import BN from "bn.js"
import { ethereumModule } from "."
import { DashboardState } from "@/types"

export function ethereumReactions(store: Store<DashboardState>) {
  store.watch((s) => s.ethereum.address, onAddressChange)

  function onAddressChange(address, old) {
    console.log("address change")
    // store.state.ethereum.provider!.(old)
    if (address === "") {
      // thereumModule.web3.removeAllListeners ethereumModule.disconnect()
      // should reset contracts
      return
    }
    ethereumModule.initERC20("LOOM")
    ethereumModule.web3.eth.getBlockNumber().then((blockNumber: number) => {
      ethereumModule.web3.eth.subscribe("newBlockHeaders", (error, event) => {
        if (!error) {
          console.log("New block header received: ", event.number)
          ethereumModule.setBlockNumber(event.number)
          if (localStorage.getItem("latestWithdrawalBlock")) {
            const value = localStorage.getItem("latestWithdrawalBlock")
            // @ts-ignore
            const block = JSON.parse(value)
            console.log("Remaining blocks: ", event.number - (block + 15))
          }
          return
        }
        console.log("Error parsing blocks: ", error)
      })
    })
  }
}
