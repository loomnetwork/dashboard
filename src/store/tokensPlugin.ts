import Debug from "debug"
import { fromEventPattern, Observable, combineLatest } from "rxjs";
import { filter, switchMap, tap, take } from "rxjs/operators";
import { Store } from "vuex";
import { setTimeout } from "timers";
import Web3 from "web3"
import { DPOSUserV3, Contracts, Client, CryptoUtils, LoomProvider } from "loom-js";
import { ERC20Gateway_v2 } from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2";
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20";
import { DashboardState } from "@/types";
import { State } from "loom-js/dist/proto/dposv3_pb";

const debug = Debug("dashboard.dpos")

export function tokensPlugin(store: Store<DashboardState>) {
  store.watch(
      (state) => state.DappChain.dposUser,
      onDposUser,
  )
  async function onDposUser(dposUser) {
    if (!dposUser) return
    const user:DPOSUserV3 = await dposUser
    const client = user.client
    const localAddress = user.loomAddress
    const account = localAddress.local.toString()
    try {
        const ethCoinInstance = await Contracts.EthCoin.createAsync(client, localAddress)
        const ethCoinBalance = await ethCoinInstance.getBalanceOfAsync(localAddress)
        const tenbalance = (ethCoinBalance.toString())
        console.log('ETH: ', tenbalance);
        store.commit('DappChain/setEthCoinInstance', ethCoinInstance)
    }
    catch (e) {
        console.error(e)
    }

    
  }
}
function setupMiddlewaresFunction(client: Client, privateKey: Uint8Array) {
    return client.txMiddleware
}