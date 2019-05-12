import { AddressMapper } from 'loom-js/dist/contracts'
import {
  Client,
  LoomProvider,
  NonceTxMiddleware,
  SignedTxMiddleware,
  SignedEthTxMiddleware,
  Address,
  LocalAddress,
  CryptoUtils,
  CachedNonceTxMiddleware
} from 'loom-js'
import { buildMutationsFromState } from '../../utils'
import { B64ToUint8Array } from 'loom-js/dist/crypto-utils'



const defaultState = () => ({
  client: null,
  signer: null,
  publicKey: null,
  addressMapper: null,
  dappChainAddress: null,
  ethereumAddress: null,
  loomProvider: null,
  isMappingOk: null
})

const actions = {
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

  async createLoomProvider({ state, commit, rootGetters }) {
    const loomProvider = new LoomProvider(state.client, B64ToUint8Array(rootGetters.getPrivateKey))

    loomProvider.setMiddlewaresForAddress(state.ethereumAddress, [
      new CachedNonceTxMiddleware(state.publicKey, state.client),
      new SignedEthTxMiddleware(state.signer)
    ])

    commit('setLoomProvider', loomProvider)
  },

  async createAddressMapper({ state, commit }) {
    const addressMapper = await AddressMapper.createAsync(
      state.client,
      new Address(state.client.chainId, LocalAddress.fromHexString(state.dappChainAddress))
    )

    commit('setAddressMapper', addressMapper)
  },

  async checkMapping({ state, commit }) {
    try {
      const address = new Address(
        state.client.chainId,
        LocalAddress.fromHexString(state.dappChainAddress)
      )
      const mappings = await state.addressMapper.getMappingAsync(address)
      if (mappings.to.local.toString().toLowerCase() !== state.ethereumAddress.toLowerCase()) {
        throw Error("Mapped address isn't valid")
      }

      console.info('Mapping exists', {
        from: mappings.from,
        fromLocal: mappings.from.local.toString(),
        to: mappings.to,
        toLocal: mappings.to.local.toString()
      })

      commit('setIsMappingOk', true)
    } catch (err) {
      console.error('error on get mapping', err)
    }
  }
}

const mutations = buildMutationsFromState(defaultState())

export const EthSignStore = {
  namespaced: true,
  state: defaultState(),
  actions,
  mutations
}
