import { Store } from "vuex"
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import BoosterPackJSON from "@/contracts/BoosterPack.json"
import packAddresses from "@/data/ZBGPackAddresses.json"

import { MigratedZBGCard } from "@/contracts/types/web3-contracts/MigratedZBGCard"

import debug from "debug"
import { DashboardState } from "@/types"
import { assetsModule } from "."

const log = debug("ui.assets")

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

export function zbcardsReactions(store: Store<DashboardState>) {
  // When a new plasma web3 instance is set,
  // create new contracts
  store.watch(
    (state) => state.plasma.web3,
    (web3) => {
      if (web3 === null) {
        // todo dispose of contracts if that's a thing
        return
      }
      const envName = store.state.plasma.networkId
      const cardInstance = new web3.eth.Contract(
        // @ts-ignore
        MigratedZBGCardJSON.abi,
        MigratedZBGCardJSON.networks[envName].address,
      ) as MigratedZBGCard
      assetsModule.setCardContract(cardInstance)

      for (const pack of PACKS_NAME) {
        const packInstance = new web3.eth.Contract(
          // @ts-ignore
          BoosterPackJSON.abi,
          packAddresses[envName][pack],
        )
        assetsModule.setPacksContract({ name: pack, contract: packInstance })
      }
    },
  )
}
