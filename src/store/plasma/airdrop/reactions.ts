import { Store } from "vuex"
import AirdropJSON from "@/contracts/Airdrop.json"

import { plasmaModule } from ".."
import { Airdrop } from "@/store/plasma/airdrop/web3-contracts/Airdrop.d.ts"

import debug from "debug"
import { DashboardState } from "@/types"
import { airdropModule } from "."

const log = debug("ui.airdrop")

export function airdropReactions(store: Store<DashboardState>) {
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
      const airdropInstance = new web3.eth.Contract(
        // @ts-ignore
        AirdropJSON.abi,
        AirdropJSON.networks[envName].address,
      ) as Airdrop
      airdropModule.setAirdropContract(airdropInstance)
      log("airdropInstance", airdropInstance)
    },
  )
}
