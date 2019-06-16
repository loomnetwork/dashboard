import { Store } from "vuex"
import debug from "debug"
import { DashboardState } from "@/types"
import { whiteListModule } from "."
import { ITier } from "loom-js/dist/contracts/user-deployer-whitelist"
import { plasmaModule } from "@/store/plasma"

const log = debug("dash.whitelist")

export function whiteListReaction(store: Store<DashboardState>) {
  // Once we have a plasma account
  // create a contract
  store.watch(
    (state) => state.plasma.address,
    async () => {
      if (store.state.disabled && store.state.disabled.includes("dev-deploy")) {
        return
      } else {
        await whiteListModule.createContract()
      }
    },
  )

  // Once we have the contract
  // load tiers
  store.watch(
    (state) => state.whiteList.userDeployerWhitelist,
    async () => {
      const tiers: ITier[] = []
      store.state.whiteList.tierIDs.forEach(async (tierID) => {
        const tierDetail = await whiteListModule.getTierInfo({ tierID })
        tiers.push(tierDetail)
      })
      whiteListModule.setDefaultTiers(tiers)
    },
  )

  // After adding a new deployer
  // refresh deployers and loom balance
  store.subscribeAction({
    after(action) {
      if (action.type === "whiteList/" + whiteListModule.addDeployer.name) {
        log("Loading tiers info")
        whiteListModule.getDeployers()
        plasmaModule.refreshBalance("LOOM")
      }
    },
  })
}
