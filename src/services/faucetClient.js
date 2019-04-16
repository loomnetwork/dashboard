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

const BN = require('bn.js')

const DPOS3 = Contracts.DPOS3
const Coin = Contracts.Coin
// const MyRinkebyTokenJSON = require('../contracts/MyRinkebyToken.json')
// const MyRinkebyCoinJSON = require('../contracts/MyRinkebyCoin.json')
// const MyTokenJSON = require('../contracts/MyToken.json')
const LoomTokenJson = require('../contracts/LoomToken.json')

// See https://loomx.io/developers/docs/en/testnet-plasma.html#contract-addresses-transfer-gateway
// for the most up to date address.
// const rinkebyGatewayAddress = '0x6f7Eb868b2236638c563af71612c9701AC30A388'
// const extdevGatewayAddress = '0xE754d9518bF4a9C63476891eF9Aa7D91c8236a5d'
const extdevChainId = 'dposv2'

function loadUserAccount(base64) {
  // const privateKey = CryptoUtils.generatePrivateKeyFromSeed(seed.slice(0, 32))
  const privateKey = CryptoUtils.B64ToUint8Array(base64)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const client = new Client(
    extdevChainId,
    createJSONRPCClient({
      protocols: [
        {
          url: 'http://13.250.37.200:46658/rpc'
        }
      ]
    }),
    createJSONRPCClient({
      protocols: [
        {
          url: 'http://13.250.37.200:46658/query'
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

export default class FaucetClient {
  userAccount = null
  userDPoS = null
  mainNetAccount = null
  coin = null

  static async createAsync(privateKey) {
    const userAccount = loadUserAccount(privateKey)
    const { account, client } = userAccount
    const userDPoS = await DPOS3.createAsync(client, account)

    const coin = await Coin.createAsync(client, account)

    return new FaucetClient(userAccount, userDPoS, coin)
  }

  static addressFromPubKey(pubKey) {
    return LocalAddress.fromPublicKey(pubKey).toString()
  }

  constructor(userAccount, userDPoS, coin) {
    this.userAccount = userAccount
    this.userDPoS = userDPoS
    this.coin = coin
  }

  async getValidatorsAsync() {
    if (this.userDPoS === null) return null
    const validators = await this.userDPoS.getValidatorsAsync()
    return validators
  }

  async getUserBalance() {
    const { account } = this.userAccount
    const balance = (await this.coin.getBalanceOfAsync(account)).div(new BN('1000000000000000000'))
    return balance.toNumber()
  }

  getUserAddress() {
    return this.userAccount.account.local.toString()
  }

  async getDelegationList() {
    const validators = await this.getValidatorsAsync()
    const delegationList = []
    if (validators) {
      for (let i = 0; i < validators.length; i += 1) {
        const validator = validators[i]
        let delegation
        try {
          delegation = await this.checkDelegationAsync(validator)
        } catch (e) {
          console.error(e)
        }
        delegationList.push(delegation)
      }
      return delegationList
    }
    return null
  }

  async checkDelegationAsync(validator) {
    return await this.userDPoS.checkDelegationAsync(
      new Address(extdevChainId, LocalAddress.fromPublicKey(validator.pubKey)),
      this.userAccount.account
    )
  }

  async delegate(amount, to) {
    const validatorAddress = new Address(extdevChainId, LocalAddress.fromHexString(to))
    const bnAmount = new BN('1000000000000000000').muln(amount)
    await this.coin.approveAsync(this.userDPoS.address, bnAmount)
    await this.userDPoS.delegateAsync(validatorAddress, bnAmount)
  }

  async unbond(amount, to) {
    const validatorAddress = new Address(extdevChainId, LocalAddress.fromHexString(to))
    await this.userDPoS.unbondAsync(
      validatorAddress,
      new BN(amount).mul(new BN('1000000000000000000'))
    )
  }
}
