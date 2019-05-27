import { HasPlasmaState, PlasmaSigner } from "./types"
import { Store } from "vuex"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { CryptoUtils, LoomProvider, Client } from "loom-js"
import { plasmaModule } from "."
import BN from "bn.js"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import Web3 from "web3"

/**
 * Vuex plugin that reacts to state changes:
 * - on plasma address change, recreate loom on eth contracts
 * and a web3 instance as interface to interact with other contracts;
 * - on web3 instance change, recreate erc20 contracts.
 *
 * @param store
 */
export function plasmaReactions(store: Store<HasPlasmaState>) {

    /**
     * on identity change
     * reinitialize coin contract
     * and reset all balances if any to zero
     */
    store.watch(
        (s) => s.plasma.address,
        () => {
            if (store.state.plasma.address === "") {
                // plasmaModule.resetState()
                return
            }
            createPlasmaWeb3(store)
            resetLoomContract(store)
            resetEthContract(store)
        },
    )

    // on web3 change
    // reset erc20 contracts
    store.watch(
        (s) => s.plasma.web3,
        (web3) => {
            if (web3 === null) {
                // clear erc20 contracts
                return
            }
            resetERC20Contracts(store)
        },
    )

}

async function resetLoomContract(store: Store<HasPlasmaState>) {
    const state = store.state.plasma
    if (state.address === "") {
        // plasmaModule.resetState()
        return
    }
    const callerAddress = await plasmaModule.getCallerAddress()
    // create loom contract
    state.coins.loom.loading = true
    state.coins.loom.contract = await Coin.createAsync(state.client, callerAddress)
    plasmaModule.refreshBalance("loom")
}

async function resetEthContract(store: Store<HasPlasmaState>) {
    const state = store.state.plasma
    const callerAddress = await plasmaModule.getCallerAddress()
    state.coins.eth.contract = await EthCoin.createAsync(state.client, callerAddress)
    state.coins.eth.loading = true
    plasmaModule.refreshBalance("eth")
}

function resetERC20Contracts(store: Store<HasPlasmaState>) {
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

async function createPlasmaWeb3(store: Store<HasPlasmaState>) {
    const state = store.state.plasma
    const signer = state.signer
    if (signer === null ) {
        // return dispose()
        return
    }
    const client = state.client
    // LoomProvider reaquires "plasma" private key (for now)
    // So we give it our default/generic app key
    const genericKey = state.appKey.private
    const loomProvider = await createLoomProvider(client, signer, genericKey)

    store.state.plasma.web3 = new Web3(loomProvider)
}

async function createLoomProvider(client: Client, signerAdapter: PlasmaSigner, genericKey: string) {
    const chain = signerAdapter.chain
    const signerAddress = await signerAdapter.getAddress()
    // LoomProvider reaquires "plasma" private key (for now)
    // So we give it our default/generic app key
    const loomProvider = new LoomProvider(
        client,
        CryptoUtils.B64ToUint8Array(genericKey),
        () => client.txMiddleware,
    )
    // setup the middle ware for signer source chain address
    // (might not be needed since in the constructor we always return client's middleware
    // as th configuration is taken care of elsewhere
    loomProvider.setMiddlewaresForAddress(signerAddress, client.txMiddleware)
    loomProvider.callerChainId = chain
    return loomProvider
}
