import { Store } from "vuex"
import { HasEthereumState } from "./types"
import { Provider } from "ethers/providers"
import { ethers } from "ethers"
import BN from "bn.js"
import { ethereumModule } from "."
import { DashboardState } from "@/types"

export function ethereumReactions(store: Store<DashboardState>) {
  store.watch((s) => s.ethereum.provider, onProviderChange)
  store.watch((s) => s.ethereum.address, onAddressChange)

  /**
   * create erc contracts, watch balances etc
   */
  function onProviderChange() {
    // if (provider === null) {
    //   return
    // }
    // reset balances create contract
  }

  function onAddressChange(address, old) {
    // store.state.ethereum.provider!.(old)
    if (address === "") {
      // should reset contracts
      return
    }
    ethereumModule.initERC20("LOOM")

    // Set latest block number every 15 seconds
    ethereumModule.web3.eth.subscribe("newBlockHeaders", (error, event) => {
      if (!error) {
        console.log("New block header received: ", event.number)
        ethereumModule.setBlockNumber(event.number)
        if (localStorage.getItem("latestWithdrawalBlock")) {
          const value = localStorage.getItem("latestWithdrawalBlock")
          // @ts-ignore
          const block = JSON.parse(value)
          console.log("Remaining blocks: ",  event.number - (block + 12))
        }
        return
      }
      console.log("Error parsing blocks: ", error)
    })
  }

  // TODO: Add a guard to check dependencies
  // store.subscribeAction({
  //     before(action) {

  //     },
  // })
}
