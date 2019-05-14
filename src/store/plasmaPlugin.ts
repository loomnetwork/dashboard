import { Store } from "vuex"
import { DashboardState } from "@/types"
import Web3 from "web3"
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import {
    LoomProvider, Client, CryptoUtils,
  } from "loom-js"
import { noop } from 'vue-class-component/lib/util';

function temp1(client: Client, privateKey: Uint8Array) {
    return []
}

export function plasmaStorePlugin(store: Store<DashboardState>) {
    store.watch(
        (state) => state.DPOS.dposUser,
        async (newUser) => {
            const user = await newUser!
            const client = user.client
            const pk = 
            "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ=="
            const uint8privatekey = CryptoUtils.B64ToUint8Array(pk)
            const loomProvider = new LoomProvider(client, uint8privatekey, temp1)
            const web3 = new Web3(loomProvider)
            const networkId = client.chainId
            const cardInstance = new web3.eth.Contract(MigratedZBGCardJSON.abi, MigratedZBGCardJSON.networks[networkId].address)
            let tokens = await cardInstance.methods.tokensOwned(user.ethAddress).call({from: user.ethAddress})
            console.log("tokens",tokens);
            
            //         let tokens = await state.cardInstance.methods
            //     .tokensOwned(payload.account)
            //     .call({ from: payload.account })
            //   let cards: any = {}
            //   tokens.indexes.forEach((id: string | number, i: string | number) => {
            //     cards[id] = parseInt(tokens.balances[i])
            //   })

        }
    )
}
    
// let result = await state.cardInstance.methods
//       .safeTransferFrom(
//         state.cardNetwork.address,
//         payload.receiver,
//         payload.cardId,
//         payload.amount
//       )
        // cardInstance.methods.safeTransferFrom(MigratedZBGCardJSON.networks[networkId], )
// card: async () => {
//     if (state.cardInstance) return
//     let cardNetwork
//     let cardInstance
//     cardNetwork = CardJSON.networks[state.loomNetwork]
//     cardInstance = new state.web3.eth.Contract(CardJSON.abi, cardNetwork.address)
//     commit('updateState', { cardNetwork, cardInstance })
//   },