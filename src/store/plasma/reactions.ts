import { HasPlasmaState, PlasmaSigner, PlasmaTokenKind } from "./types"
import { Store } from "vuex"
import { Coin, EthCoin } from "loom-js/dist/contracts"
import { CryptoUtils, LoomProvider, Client, LocalAddress } from "loom-js"
import { plasmaModule } from "."
import BN from "bn.js"
import { ERC20 } from "./web3-contracts/ERC20"
import ERC20abi from "loom-js/dist/mainnet-contracts/ERC20.json"
import Web3 from "web3"

import * as Tokens from "./tokens"
import { Web3Provider } from "ethers/providers"
import { ethers } from "ethers"
import { publicKeyFromPrivateKey } from "loom-js/dist/crypto-utils"
import { DashboardState } from "@/types"

import TOKENS from "@/data/topTokensSymbol.json"

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
      resetLoomContract(store)
      resetEthContract(store)
      resetERC20Contracts(store)
    },
  )
}

async function resetLoomContract(store: Store<DashboardState>) {
  const state = store.state.plasma
  if (state.address === "") {
    // plasmaModule.resetState()
    return
  }
  const caller = await plasmaModule.getCallerAddress()
  const contract = await Coin.createAsync(state.client!, caller)
  await Tokens.addContract("loom", PlasmaTokenKind.LOOMCOIN, contract)
  state.coins.loom = {
    balance: new BN("0"),
    loading: true,
  }
  plasmaModule.refreshBalance("loom")
}

async function resetEthContract(store: Store<DashboardState>) {
  const state = store.state.plasma
  const caller = await plasmaModule.getCallerAddress()
  const contract = await EthCoin.createAsync(state.client!, caller)
  await Tokens.addContract("eth", PlasmaTokenKind.ETH, contract)
  state.coins.eth = {
    balance: new BN("0"),
    loading: true,
  }
  plasmaModule.refreshBalance("eth")
}

async function resetERC20Contracts(store: Store<DashboardState>) {
  const state = store.state.plasma
  // for each other token create a contract (also loomProvider)
  const tokens = TOKENS.tokens.slice(0, 4)
  const provider = state.ethersProvider!
  const web3 = state.web3!
  const network = state.networkId
  tokens.forEach(async (tokenInfo) => {
    const address = tokenInfo.address[network]
    const symbol = tokenInfo.symbol
    state.coins[tokenInfo.symbol] = {
      decimals: tokenInfo.decimal,
      balance: new BN("0"),
      loading: true,
    }
    // @ts-ignore
    const contract = new web3.eth.Contract(address, ERC20abi, provider) as ERC20
    await Tokens.addContract(symbol, PlasmaTokenKind.ERC20, contract)
    plasmaModule.refreshBalance(symbol)
  })
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
      ? await createSimpleLoomProvider(client, genericKey)
      : await createLoomProvider(client, signer, genericKey)
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
