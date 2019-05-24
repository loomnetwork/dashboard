import { Store } from "vuex"
import { DashboardState } from "@/types"
import Web3 from "web3"
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import BoosterPackJSON from "@/contracts/BoosterPack.json"
import {
    LoomProvider, Client, CryptoUtils, NonceTxMiddleware, SignedEthTxMiddleware, Address, LocalAddress,
  } from "loom-js"
import { plasmaModule } from "./plasma"
import packAddresses from "@/data/ZBGPackAddresses.json"

function setupMiddlewaresFunction(client: Client, privateKey: Uint8Array) {
    return client.txMiddleware
}

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

export function plasmaStorePlugin(store: Store<DashboardState>) {
    store.watch(
        (state) => state.DPOS.dposUser,
        async (newUser) => {
            const user = await newUser!
            const client = user.client
            const dashboardPrivateKey = store.state.DPOS.dashboardPrivateKey
            const uint8PrivateKey = CryptoUtils.B64ToUint8Array(dashboardPrivateKey)
            const loomProvider = new LoomProvider(client, uint8PrivateKey, setupMiddlewaresFunction)
            loomProvider.setMiddlewaresForAddress(user.ethAddress, client.txMiddleware)
            loomProvider.callerChainId = "eth"
            const web3 = new Web3(loomProvider)
            const networkId = store.state.DPOS.networkId
            // MigratedZBGCardJSON for abi and address
            const cardInstance = new web3.eth.Contract(
                MigratedZBGCardJSON.abi,
                MigratedZBGCardJSON.networks[networkId].address)
            for (const pack of PACKS_NAME) {
                // BoosterPackJSON for abi only, use address from ZBGPackAddress file
                const packInstance = new web3.eth.Contract(BoosterPackJSON.abi,
                    packAddresses[networkId][pack])
                plasmaModule.setPacksContract({name: pack, contract: packInstance})
            }
            // @ts-ignore
            plasmaModule.setCardContract(cardInstance)
        },
    )
}
