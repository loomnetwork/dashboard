import { Store } from "vuex"
import { HasEthereumState } from "./types"
import { Provider } from "ethers/providers"
import { ethers } from "ethers"
import BigNumber from "bignumber.js"
import { ethereumModule } from "."

export function ethereumReactions(store: Store<HasEthereumState>) {

    store.watch((s) => s.ethereum.provider, onProviderChange)
    store.watch((s) => s.ethereum.address, onAddressChange)

    /**
     * create erc contracts, watch balances etc
     */
    function onProviderChange(provider: Provider|null, old) {
        if (provider === null) {
            return
        }
        // reset balances create contract
    }

    function onAddressChange(address, old) {
        // store.state.ethereum.provider!.(old)
        if (address === "") {
            return
        }
        ethereumModule.initERC20("loom")
    }
}

function listenToEthBalance(store: Store<HasEthereumState>) {
    const address = store.state.ethereum.address
    const provider = store.state.ethereum.provider!

    const setBalance = (balance: ethers.utils.BigNumber) => {
        store.state.ethereum.balances.eth = new BigNumber(balance.toString())
    }

    provider.getBalance(address).then(setBalance)
    provider.on(address, setBalance)
}
