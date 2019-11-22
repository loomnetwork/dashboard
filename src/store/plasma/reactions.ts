import { PlasmaSigner, PlasmaTokenKind } from "./types"
import { Store } from "vuex"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { CryptoUtils, LoomProvider, Client, LocalAddress } from "loom-js"
import { plasmaModule } from "."
import BN from "bn.js"
import Web3 from "web3"

import * as Tokens from "./tokens"
import { Web3Provider } from "ethers/providers"
import { ethers } from "ethers"
import { publicKeyFromPrivateKey } from "loom-js/dist/crypto-utils"
import { DashboardState } from "@/types"

import debug from "debug"
import { tokenService } from "@/services/TokenService"
const log = debug("dash.plasma")

/**
 * Vuex plugin that reacts to state changes:
 * - on plasma address change, recreate loom on eth contracts
 * and a web3 instance as interface to interact with other contracts;
 * - on web3 instance change, recreate erc20 contracts.
 *
 * @param store
 */
export function plasmaReactions(store: Store<DashboardState>) {
  /**
   * on identity change
   * reinitialize coin contract
   * and reset all balances if any to zero
   */
  store.watch(
    (s) => s.plasma.address,
    async () => {
      if (store.state.plasma.address === "") {
        // plasmaModule.resetState()
        Tokens.resetContracts()
        return
      }
      await createPlasmaWeb3(store)
      await resetLoomContract(store)
      await resetEthContract(store)
      await resetERC20Contracts(store)
    },
  )

  store.subscribeAction({
    async after(action) {
      if (
        action.type === "plasma/transfer" ||
        action.type === "plasma/addToken"
      ) {
        console.log("in subscription ", action)
        await plasmaModule.refreshBalance(
          action.payload.symbol || action.payload,
        )
      }
    },
  })
}

async function resetLoomContract(store: Store<DashboardState>) {
  const state = store.state.plasma
  if (state.address === "") {
    // plasmaModule.resetState()
    return
  }
  const caller = await plasmaModule.getCallerAddress()
  const contract = await Coin.createAsync(state.client!, caller)
  await Tokens.addContract("LOOM", PlasmaTokenKind.LOOMCOIN, contract)
  state.coins.LOOM = {
    balance: new BN("0"),
    loading: true,
    decimals: 18,
  }
  plasmaModule.refreshBalance("LOOM")
}

async function resetEthContract(store: Store<DashboardState>) {
  const state = store.state.plasma
  const caller = await plasmaModule.getCallerAddress()
  const contract = await EthCoin.createAsync(state.client!, caller)
  await Tokens.addContract("ETH", PlasmaTokenKind.ETH, contract)
  state.coins.ETH = {
    balance: new BN("0"),
    loading: true,
    decimals: 18,
  }
  plasmaModule.refreshBalance("ETH")
}

async function resetERC20Contracts(store: Store<DashboardState>) {
  plasmaModule.addToken(tokenService.get("BNB")!)
}

async function createPlasmaWeb3(store: Store<DashboardState>) {
  const state = store.state.plasma
  const signer = state.signer
  const client = state.client!
  // LoomProvider reaquires "plasma" private key (for now)
  // So we give it our default/generic app key
  const genericKey = state.appId.private
  const loomProvider =
    signer === null
      ? await createSimpleLoomProvider(client!, genericKey)
      : await createLoomProvider(client!, signer, genericKey)
  // @ts-ignore
  store.state.plasma.web3 = new Web3(loomProvider)
  store.state.plasma.ethersProvider = new Web3Provider(loomProvider)
}

async function createLoomProvider(
  client: Client,
  signerAdapter: PlasmaSigner,
  strDummyKey: string,
) {
  const chain = signerAdapter.chain
  const signerAddress = await signerAdapter.getAddress()
  const dummyKey = CryptoUtils.B64ToUint8Array(strDummyKey)
  const publicKey = publicKeyFromPrivateKey(dummyKey)
  const dummyAccount = LocalAddress.fromPublicKey(publicKey).toString()
  // LoomProvider reaquires "plasma" private key (for now)
  // So we give it our default/generic app key
  const loomProvider = new LoomProvider(
    client,
    dummyKey,
    () => client.txMiddleware,
  )
  // setup the middle ware for signer source chain address
  // (might not be needed since in the constructor we always return client's middleware
  // as th configuration is taken care of elsewhere
  loomProvider.setMiddlewaresForAddress(signerAddress, client.txMiddleware)
  loomProvider.callerChainId = chain
  // remove dummy account
  loomProvider.accounts.delete(dummyAccount)
  // @ts-ignore
  loomProvider._accountMiddlewares.delete(dummyAccount)
  return loomProvider
}

async function createSimpleLoomProvider(client: Client, strDummyKey: string) {
  const dummyKey = CryptoUtils.B64ToUint8Array(strDummyKey)
  const publicKey = publicKeyFromPrivateKey(dummyKey)
  const dummyAccount = LocalAddress.fromPublicKey(publicKey).toString()
  // LoomProvider reaquires "plasma" private key (for now)
  // So we give it our default/generic app key
  const loomProvider = new LoomProvider(
    client,
    dummyKey,
    () => client.txMiddleware,
  )
  // remove dummy account
  loomProvider.accounts.delete(dummyAccount)
  // @ts-ignore
  loomProvider._accountMiddlewares.delete(dummyAccount)
  return loomProvider
}
