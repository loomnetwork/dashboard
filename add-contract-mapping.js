/**
 * This script adds a mapping between the DAppChain and Ethereum card contracts to the
 * Transfer Gateway. Currently this script is only used by setup_local_test_env.sh.
 */

const { readFileSync } = require('fs')
const Web3 = require('web3')

const {
  NonceTxMiddleware, SignedTxMiddleware, Client, Address, Contracts,
  LocalAddress, CryptoUtils, createJSONRPCClient, Web3Signer, soliditySha3
} = require('loom-js')

async function main() {
  const cmdlineArgs = process.argv.slice(2)
  const dAppChainDeploymentInfo = JSON.parse(readFileSync(cmdlineArgs[0], 'utf-8'))
  const ethereumDeploymentInfo = JSON.parse(readFileSync(cmdlineArgs[1], 'utf-8'))
  const privateKey = CryptoUtils.B64ToUint8Array(readFileSync(cmdlineArgs[2], 'utf-8'))
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

  const chainId = 'default'
  const writeUrl = 'http://127.0.0.1:46658/rpc'
  const readUrl = 'http://127.0.0.1:46658/query'

  const writer = createJSONRPCClient({ protocols: [{ url: writeUrl }] })
  const reader = createJSONRPCClient({ protocols: [{ url: readUrl }] })
  const client = new Client(chainId, writer, reader)

  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ]

  const transferGateway = await Contracts.TransferGateway.createAsync(
    client,
    new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
  )

  const foreignContract = new Address(
    'eth', LocalAddress.fromHexString(ethereumDeploymentInfo.cardContractAddress)
  )
  const localContract = new Address(
    client.chainId, LocalAddress.fromHexString(dAppChainDeploymentInfo.cardContractAddress)
  )

  const web3 = new Web3('http://localhost:8545')
  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]

  const web3Signer = new Web3Signer(web3, owner)
  const hash = soliditySha3(
    { type: 'address', value: foreignContract.local.toString().slice(2) },
    { type: 'address', value: localContract.local.toString().slice(2) }
  )

  const creatorSig = await web3Signer.signAsync(hash)
  const creatorTxHash = Buffer.from(ethereumDeploymentInfo.cardContractTxHash.slice(2), 'hex')

  await transferGateway.addContractMappingAsync({
    foreignContract,
    localContract,
    foreignContractCreatorSig: creatorSig,
    foreignContractCreatorTxHash: creatorTxHash
  })
}

async function tryMain() {
  try {
    await main()
  } catch (err) {
    console.error(err)
  }
}

tryMain()
