import { CryptoUtils, Contracts, Address, Web3Signer } from 'loom-js'
import BN from 'bn.js'

import EthereumGatewayJSON from '../contracts/Gateway.json'

const TransferGateway = Contracts.TransferGateway
const AddressMapper = Contracts.AddressMapper

export default class TransferGatewayClient {
  dAppChainClient = null
  dAppChainGateway = null
  userDAppChainAddress = null
  userEthAddress = null
  gatewayEthAddress = null
  cardsDAppChainContract = null
  cardsEthContract = null
  cardsEthAddress = null
  cardsDAppChainAddress = null
  web3js = null
  web3Signer = null

  static async create({
    web3js,
    dAppChainClient,
    userDAppChainAddress,
    userEthAddress,
    gatewayEthAddress,
    cardsDAppChainContract,
    cardsEthContract,
    cardsEthAddress,
    cardsDAppChainAddress
  }) {
    const dAppChainGateway = await TransferGateway.createAsync(
      dAppChainClient,
      userDAppChainAddress
    )
    return new TransferGatewayClient({
      dAppChainClient,
      web3js,
      dAppChainGateway,
      userDAppChainAddress,
      userEthAddress,
      gatewayEthAddress,
      cardsDAppChainContract,
      cardsEthContract,
      cardsEthAddress,
      cardsDAppChainAddress
    })
  }

  constructor({
    dAppChainClient,
    web3js,
    dAppChainGateway,
    userDAppChainAddress,
    userEthAddress,
    gatewayEthAddress,
    cardsDAppChainContract,
    cardsEthContract,
    cardsEthAddress,
    cardsDAppChainAddress
  }) {
    this.dAppChainClient = dAppChainClient
    this.web3js = web3js
    this.dAppChainGateway = dAppChainGateway
    this.userDAppChainAddress = userDAppChainAddress
    this.userEthAddress = userEthAddress
    this.gatewayEthAddress = gatewayEthAddress
    this.cardsDAppChainContract = cardsDAppChainContract
    this.cardsEthContract = cardsEthContract
    this.cardsEthAddress = cardsEthAddress
    this.cardsDAppChainAddress = cardsDAppChainAddress
    this.web3Signer = new Web3Signer(this.web3js, this.userEthAddress)
  }

  /**
   * Attempts to resume a previously initiated withdrawal.
   */
  async resumeCardWithdrawal({ receipt }) {
    const { tokenOwner, tokenId, tokenAmount } = receipt
    const withdrawalSig = CryptoUtils.bytesToHexAddr(receipt.oracleSignature)
    const ethereumGateway = new this.web3js.eth.Contract(
      EthereumGatewayJSON.abi,
      this.gatewayEthAddress
    )
    const cardsEthAddress = receipt.tokenContract.local.toString()
    // eslint-disable-next-line
    console.debug(`resuming withdrawal of ${tokenAmount} of token ${tokenId} (${cardsEthAddress}) from Ethereum Gateway ${this.gatewayEthAddr}`)
    await ethereumGateway.methods
      .withdrawERC721X(tokenId, tokenAmount, withdrawalSig, cardsEthAddress)
      .send({ from: tokenOwner.local.toString() })
    console.debug(`${tokenAmount} of token ${tokenId} successfully withdrawn from Ethereum Gateway`)
  }

  /**
   * Links the current user's DAppChain address to their Ethereum address (from MetaMask).
   */
  async ensureIdentityMappingExists() {
    const addressMapper = await AddressMapper.createAsync(
      this.dAppChainClient,
      this.userDAppChainAddress
    )
    try {
      // this will throw if a mapping isn't found...
      await addressMapper.getMappingAsync(this.userDAppChainAddress)
    } catch (err) {
      // add the mapping if it doesn't exist already
      const ethAddr = Address.fromString(`eth:${this.userEthAddress}`)
      console.log(
        `mapping user DAppChain address ${this.userDAppChainAddress} to ${ethAddr.toString()}`
      )
      await addressMapper.addIdentityMappingAsync(
        this.userDAppChainAddress,
        ethAddr,
        this.web3Signer
      )
    }
  }

  /**
   * Withdraws the given card(s) from the user's DAppChain account to their Ethereum account.
   * @param {Number} timeout Number of ms to wait for the withdrawal to be confirmed by the TG Oracle.
   */
  async withdrawCard({ tokenId, amount, timeout }) {
    // TODO: This should be removed when the Address Mapper is removed from the DAppChain->Ethereum flow
    await this.ensureIdentityMappingExists()
    // NOTE:
    // For ERC721/ERC20/ETH should use approve() to authorize transfer of specific token ID/amount.
    // For ERC721X have no choice but to use setApprovalForAll() because approve() doesn't support
    // fungible tokens.
    const dAppChainGatewayAddrStr = this.dAppChainGateway.address.local.toChecksumString()
    const dAppChainUserAddrStr = this.userDAppChainAddress.local.toChecksumString()
    await this.cardsDAppChainContract.methods
      .setApprovalForAll(dAppChainGatewayAddrStr, true)
      .send({ from: dAppChainUserAddrStr })
    console.log(`approved gateway to transfer ${amount} of token ${tokenId}`)
    const cardsDAppChainAddr = Address.fromString(
      `${this.dAppChainClient.chainId}:${this.cardsDAppChainAddress}`
    )
    const receiveSignedWithdrawalEvent = new Promise((resolve, reject) => {
      let timer = setTimeout(
        () => reject(new Error('Timeout while waiting for withdrawal to be signed')),
        timeout
      )
      const listener = event => {
        const contractEthAddr = Address.fromString(`eth:${this.cardsEthAddress}`)
        const ownerEthAddr = Address.fromString(`eth:${this.userEthAddress}`)
        if (
          event.tokenContract.toString() === contractEthAddr.toString() &&
          event.tokenOwner.toString() === ownerEthAddr.toString()
        ) {
          // eslint-disable-next-line
          console.log(`received signed withdrawal receipt for ${event.tokenAmount} of token ${event.tokenId}`)
          clearTimeout(timer)
          timer = null
          this.dAppChainGateway.removeAllListeners(TransferGateway.EVENT_TOKEN_WITHDRAWAL)
          resolve(event)
        }
      }
      this.dAppChainGateway.on(TransferGateway.EVENT_TOKEN_WITHDRAWAL, listener)
    })

    console.log(`begin withdrawal of ${amount} of token ${tokenId} from DAppChain Gateway`)
    await this.dAppChainGateway.withdrawERC721XAsync(
      new BN(tokenId),
      new BN(amount),
      cardsDAppChainAddr
    )
    console.log('revoke authorization from DAppChain Gateway')
    // Revoke previous authorization now that the DAppChain Gateway has withdrawn the tokens
    await this.cardsDAppChainContract.methods
      .setApprovalForAll(dAppChainGatewayAddrStr, false)
      .send({ from: dAppChainUserAddrStr })
    // Wait for withdrawal to be signed by the Transfer Gateway Oracle
    const event = await receiveSignedWithdrawalEvent
    // TODO: check token ID & amount of event match original values
    const withdrawalSig = CryptoUtils.bytesToHexAddr(event.sig)

    const ethereumGateway = new this.web3js.eth.Contract(
      EthereumGatewayJSON.abi,
      this.gatewayEthAddress
    )

    // eslint-disable-next-line
    console.log(`withdraw ${amount} of token ${tokenId} (${this.cardsEthAddress}) from Ethereum Gateway ${this.gatewayEthAddress}`)
    await ethereumGateway.methods
      .withdrawERC721X(new BN(tokenId), new BN(amount), withdrawalSig, this.cardsEthAddress)
      .send({ from: this.userEthAddress })

    console.log(`${amount} of token ${tokenId} successfully withdrawn from Ethereum Gateway`)
  }

  async getEthereumGatewayBalance({ tokenId }) {
    return await this.cardsEthContract.methods
      .balanceOf(this.gatewayEthAddress, tokenId)
      .call({ from: this.userEthAddress })
  }
}
