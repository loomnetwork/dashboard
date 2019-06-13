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
    pollBlockNumber()

  }

  // TODO: Add a guard to check dependencies
  // store.subscribeAction({
  //     before(action) {

  //     },
  // })
}

function pollBlockNumber() {
  setInterval(async () => {
    const result = await ethereumModule.web3.eth.getBlockNumber() || 0
    console.log("Latest block #", result)
    ethereumModule.setBlockNumber(result)
  }, 15 * 1000)
}
