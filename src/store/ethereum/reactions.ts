import { Store } from "vuex"
import { ethereumModule } from "."
import { DashboardState } from "@/types"

export function ethereumReactions(store: Store<DashboardState>) {
  store.watch((s) => s.ethereum.address, onAddressChange)

  // TODO move this to gateway module
  store.watch((s) => s.ethereum.blockNumber, checkWithdrawal)

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

    // TODO move to gateway module
    if (localStorage.getItem("latestWithdrawalBlock")) {
      const blockNumber = Number(localStorage.getItem("latestWithdrawalBlock"))
      if (blockNumber > 0) {
        console.log("Setting the latest withdrawal block", blockNumber)
        ethereumModule.setLatestWithdrawalBlock(blockNumber)
      }
    }
  }

  // TODO move this to gateway module
  function checkWithdrawal(lastBlockNumber: number) {
    console.log("checkWithdrawal")
    // If a claimed withdrawal receipt exists...
    if (ethereumModule.state.latestWithdrawalBlock && ethereumModule.state.latestWithdrawalBlock > 0) {
      // ...check if it has expired
      const threshold = (ethereumModule.state.latestWithdrawalBlock + 15)
      if (threshold <= lastBlockNumber) {
        ethereumModule.setClaimedReceiptHasExpired(true)
        ethereumModule.setLatestWithdrawalBlock(0)
        localStorage.removeItem("latestWithdrawalBlock")
        return
      }
      console.log("Remaining blocks until cooldown complete: ", threshold - lastBlockNumber)
    }

  }
}
