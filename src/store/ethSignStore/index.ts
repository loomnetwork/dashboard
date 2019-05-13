import { AddressMapper } from "loom-js/dist/contracts"
import {
  LoomProvider,
  SignedEthTxMiddleware,
  Address,
  LocalAddress,
  CachedNonceTxMiddleware,
  Client,
} from "loom-js"
import { B64ToUint8Array } from "loom-js/dist/crypto-utils"
import { getStoreBuilder, BareActionContext } from "vuex-typex"
import { DashboardState } from "@/types"
import { CommonTypedStore } from "../common"
import { ethers } from "ethers"

export interface EthSignState {
  client: Client | null
  signer: ethers.Signer | null
  publicKey: Uint8Array | null
  addressMapper: AddressMapper | null
  dappChainAddress: string
  ethereumAddress: string
  loomProvider: LoomProvider | null
  isMappingOk: boolean
}

declare type ActionContext = BareActionContext<EthSignState, DashboardState>

function defaultState(): EthSignState {
  return {
    client: null,
    signer: null,
    publicKey: null,
    addressMapper: null,
    dappChainAddress: "",
    ethereumAddress: "",
    loomProvider: null,
    isMappingOk: false,
  }
}

const builder = getStoreBuilder<DashboardState>().module(
  "EthSign",
  defaultState(),
)
const stateGetter = builder.state()

export const EthSign = {
  get state() {
    return stateGetter()
  },

  setLoomProvider: builder.commit(setLoomProvider),
  setAddressMapper: builder.commit(setAddressMapper),
  setIsMappingOk: builder.commit(setIsMappingOk),

  createLoomProvider: builder.dispatch(createLoomProvider),
  createAddressMapper: builder.dispatch(createAddressMapper),
  checkMapping: builder.dispatch(checkMapping),
}

// async createClient({ rootState, commit, rootGetters }) {
//   const chainURLs = rootState.DappChain.chainUrls[rootState.DappChain.chainIndex]
//   const client = new Client(chainURLs.network, chainURLs.websockt, chainURLs.queryws)
//   // @ts-ignore
//   const ethersProvider = new ethers.providers.Web3Provider(web3.currentProvider)
//   const signer = ethersProvider.getSigner()

//   client.txMiddleware = [
//     new NonceTxMiddleware(,client),
//         // @ts-ignore
//     new SignedEthTxMiddleware(signer)
//   ]

//   const publicKey = CryptoUtils.publicKeyFromPrivateKey(
//     B64ToUint8Array(rootGetters.getPrivateKey)
//   )

//   const dappChainAddress = LocalAddress.fromPublicKey(publicKey).toString()
//   const ethereumAddress = await signer.getAddress()

//   commit('setClient', client)
//   commit('setSigner', signer)
//   commit('setPublicKey', publicKey)
//   commit('setEthereumAddress', ethereumAddress)
//   commit('setDappChainAddress', dappChainAddress)
// },

function setLoomProvider(state, value: LoomProvider | null) { state.loomProvider = value}
function setAddressMapper(state, value: AddressMapper | null) { state.addressMapper = value}
function setIsMappingOk(state, value: boolean) { state.isMappingOk = value}

async function createLoomProvider(ctx: ActionContext) {
  const { state } = ctx
  const loomProvider = new LoomProvider(
    state.client!,
    B64ToUint8Array(CommonTypedStore.getPrivateKey()),
  )

  loomProvider.setMiddlewaresForAddress(state.ethereumAddress, [
    new CachedNonceTxMiddleware(state.publicKey!, state.client!),
    // @ts-ignore
    new SignedEthTxMiddleware(state.signer!),
  ])

  EthSign.setLoomProvider(loomProvider)
}

async function createAddressMapper(ctx: ActionContext) {
  const addressMapper = await AddressMapper.createAsync(
    ctx.state.client!,
    new Address(
      ctx.state.client!.chainId,
      LocalAddress.fromHexString(ctx.state.dappChainAddress),
    ),
  )
  EthSign.setAddressMapper(addressMapper)
}

async function checkMapping(ctx: ActionContext) {
  try {
    const address = new Address(
      ctx.state.client!.chainId,
      LocalAddress.fromHexString(ctx.state.dappChainAddress),
    )
    const mappings = await ctx.state.addressMapper!.getMappingAsync(address)
    if (
      mappings.to.local.toString().toLowerCase() !==
      ctx.state.ethereumAddress.toLowerCase()
    ) {
      throw Error("Mapped address isn't valid")
    }

    console.info("Mapping exists", {
      from: mappings.from,
      fromLocal: mappings.from.local.toString(),
      to: mappings.to,
      toLocal: mappings.to.local.toString(),
    })

    EthSign.setIsMappingOk(true)
  } catch (err) {
    console.error("error on get mapping", err)
  }
}

// const mutations = buildMutationsFromState(defaultState())

// export const EthSignStore = {
//   namespaced: true,
//   state: defaultState(),
//   actions,
//   mutations,
// }
