/* eslint-disable class-methods-use-this */
const Web3 = require('web3')
const {
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Address,
  LocalAddress,
  CryptoUtils,
  LoomProvider,
  Contracts,
  createJSONRPCClient
} = require('loom-js')

import axios from 'axios'

const BN = require('bn.js')

const DPOS2 = Contracts.DPOS2
const Coin = Contracts.Coin

const extdevChainId = '4'

const originalChain = chain => {
  let chainUrl = chain
  if (chainUrl.endsWith('/rpc')) {
    chainUrl = chainUrl.slice(0, -3)
  } else if (chainUrl.endsWith('/rpc/')) {
    chainUrl = chainUrl.slice(0, -4)
  } else if (!chainUrl.endsWith('/')) {
    chainUrl += '/'
  }
  return chainUrl
}

export function loadUserAccount(chainUrl, base64) {
  const chain = originalChain(chainUrl)
  let privateKey
  if (base64) {
    privateKey = CryptoUtils.B64ToUint8Array(base64)
  } else {
    privateKey = CryptoUtils.generatePrivateKey()
  }
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

  const client = new Client(
    extdevChainId,
    createJSONRPCClient({
      protocols: [
        {
          url: `${chain}rpc`
        }
      ]
    }),
    createJSONRPCClient({
      protocols: [
        {
          url: `${chain}query`
        }
      ]
    })
  )
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ]
  client.on('error', msg => {
    console.error('PlasmaChain connection error', msg)
  })

  return {
    account: new Address(extdevChainId, LocalAddress.fromPublicKey(publicKey)),
    web3js: new Web3(new LoomProvider(client, privateKey)),
    client
  }
}

async function getConsensusState(chain) {
  const instance = axios.create({
    headers: {}
  })
  const response = await instance.get(`${originalChain(chain)}rpc/dump_consensus_state`)
  return response.data.result
}

export async function getCandidatesAsync(chain) {
  const { account, client } = loadUserAccount(chain, null)
  const DPoS = await DPOS2.createAsync(client, account)
  const candidates = await DPoS.getCandidatesAsync()
  return candidates
}

export async function getValidatorsAsync(chain) {
  const consensusState = await getConsensusState(chain)
  const validators = consensusState.round_state.validators.validators
  return validators
}

export async function getBalance(chain, base64Key) {
  const { account, client } = loadUserAccount(chain, base64Key)
  const coin = await Coin.createAsync(client, account)
  const balance = (await coin.getBalanceOfAsync(account)).div(new BN('1000000000000000000'))
  return balance.toNumber()
}

export function getAddress(base64Key) {
  const privateKey = CryptoUtils.B64ToUint8Array(base64Key)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const account = new Address(extdevChainId, LocalAddress.fromPublicKey(publicKey))
  return account.local.toString()
}

export async function delegateAsync(chain, base64Key, to, amount) {
  const { account, client } = loadUserAccount(chain, base64Key)

  const validatorAddress = new Address(extdevChainId, LocalAddress.fromHexString(to))
  const bnAmount = new BN('1000000000000000000').muln(amount)

  const coin = await Coin.createAsync(client, account)
  const DPoS = await DPOS2.createAsync(client, account)
  await coin.approveAsync(DPoS.address, bnAmount)
  await DPoS.delegateAsync(validatorAddress, bnAmount)
}

export async function unbondAsync(chain, base64Key, to, amount) {
  const { account, client } = loadUserAccount(chain, base64Key)

  const validatorAddress = new Address(extdevChainId, LocalAddress.fromHexString(to))
  const bnAmount = new BN('1000000000000000000').muln(amount)

  const DPoS = await DPOS2.createAsync(client, account)
  await DPoS.unbondAsync(validatorAddress, bnAmount)
}

export function addressFromPubKey(pubKey) {
  if (typeof pubKey === 'string') {
    return LocalAddress.fromPublicKey(CryptoUtils.B64ToUint8Array(pubKey)).toString()
  }
  return LocalAddress.fromPublicKey(pubKey).toString()
}

export async function getDelegationListAsync(chain, base64Key) {
  const { account, client } = loadUserAccount(chain, base64Key)
  const DPoS = await DPOS2.createAsync(client, account)

  const candidates = await getCandidatesAsync(chain)
  const delegationList = []
  if (candidates) {
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i]
      let delegation
      try {
        delegation = await DPoS.checkDelegationAsync(
          new Address(extdevChainId, LocalAddress.fromPublicKey(candidate.pubKey)),
          account
        )
      } catch (e) {
        console.error(e)
      }
      delegationList.push(delegation)
    }
    return delegationList
  }
  return null
}

export async function checkDelegationAsync(chain, base64Key, validator) {
  const { account, client } = loadUserAccount(chain, base64Key)
  const DPoS = await DPOS2.createAsync(client, account)

  if (typeof validator === 'string') {
    const hexAddress = validator.startsWith('0x') ? validator : `0x${validator}`
    return await DPoS.checkDelegationAsync(
      new Address(extdevChainId, LocalAddress.fromHexString(hexAddress)),
      account
    )
  }
  return await DPoS.checkDelegationAsync(
    new Address(extdevChainId, LocalAddress.fromPublicKey(validator.pubKey)),
    account
  )
}
