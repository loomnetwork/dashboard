import { Store } from "vuex"
import debug from "debug"
import { DashboardState } from "@/types"
import { whiteListModule } from "."
import { ITier } from 'loom-js/dist/contracts/user-deployer-whitelist';

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
      await whiteListModule.createUserDeployerWhitelistAsync()
    },
  )

  store.watch(
    (state) => state.whiteList.whiteListContractAddress,
    async () => {
      const tiers: ITier[] = []
      store.state.whiteList.tierIDs.forEach(async (tierID) => {
        const tierDetail = await whiteListModule.getTierInfoAsync({tierID})
        tiers.push(tierDetail)
      })
      whiteListModule.setDefaultTiers(tiers)
    },
  )
}
