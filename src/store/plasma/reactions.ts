import { HasPlasmaState } from "./types"
import { Store } from "vuex"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { LocalAddress, Address } from "loom-js"
import { plasmaModule } from "."
import BN from "bn.js"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"

export function plasmaReactions(store: Store<HasPlasmaState>) {

    store.watch(
        (s) => s.plasma.address,
        onIdentityChange,
    )

    /**
     * on identity chain
     * reinitialize coin contract
     * and reset all balances if any to zero
     */
    async function onIdentityChange() {
        const state = store.state.plasma
        // if disconnected reset token info states
        if (state.address === "") {
            // plasmaModule.resetState()
            return
        }

        const callerAddress = await plasmaModule.getCallerAddress()
        // create loom contract
        state.coins.loom.contract = await Coin.createAsync(state.client, callerAddress)
        state.coins.loom.loading = true
        plasmaModule.updateBalance("loom")

        state.coins.eth.contract = await EthCoin.createAsync(state.client, callerAddress)
        state.coins.eth.loading = true
        plasmaModule.updateBalance("eth")
        // createERC20Contracts() // or may be lazy on demand?
    }

    function createERC20Contracts() {
        const state = store.state.plasma
        // for each other token create a contract (also loomProvider)
        const tokens = [{symbol: "", address: ""}]
        const Contract = state.web3!.eth.Contract
        tokens.forEach(({symbol, address}) => {
            state.coins[symbol] = {
                // @ts-ignore
                contract: new Contract([], address) as ERC20,
                balance: new BN("0"),
                loading: true,
            }
        })
    }

}

