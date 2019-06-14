import { Store } from "vuex"
import debug from "debug"
import { DashboardState } from "@/types"
import { whiteListModule } from "."

const log = debug("whitelist")

// Can we get these from the contracts
export const PACKS_NAME = [
  "booster",
  "super",
  "air",
  "earth",
  "fire",
  "life",
  "toxic",
  "water",
  "binance",
  "tron",
]

export function whiteListReaction(store: Store<DashboardState>) {
  store.watch(
    (state) => state.plasma.address,
    async () => {
      if (store.state.disabled && store.state.disabled.includes("dev-deploy")) {
        return
      } else {
        await whiteListModule.createUserDeployerWhitelistAsync()
      }
    },
  )
}
