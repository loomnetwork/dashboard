/* eslint-disable */
import Web3 from 'web3'
import LoomTokenJSON from '../contracts/LoomToken.json'

export default class Contract {
  constructor() {
    this.zbgStakeInstance = null
    this.loomTokenInstance = null
    this.currentAccount = null
    this.zbgStakeNetwork = null
    this.zbgSaleInstance = null
    this.zbgSaleNetwork = null
    this.currentNetwork = 0
  }

  hasMetaMask() {
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3js = new Web3(web3.currentProvider)
      return true
    }
    return false
  }

  async hasContractDeployed() {
    const currentNetwork = await this._getCurrentNetwork()
    this.currentNetwork = currentNetwork
    this.zbgStakeNetwork = ZombieBattlegroundStakeJSON.networks[currentNetwork]
    this.zbgSaleNetwork = ZombieBattlegroundSaleJSON.networks[currentNetwork]
    console.log('current stake network', currentNetwork, this.zbgStakeNetwork)
    console.log('current sales network', currentNetwork, this.zbgSaleNetwork)
    return !!this.zbgStakeNetwork && !!this.zbgSaleNetwork
  }

  async canGetAccounts() {
    const accounts = await this._getAccounts()
    console.log('accounts', accounts)
    this.currentAccount = accounts[0]
    return !!this.currentAccount
  }

  async loadContract() {
    this.zbgStakeInstance = new this.web3js.eth.Contract(
      ZombieBattlegroundStakeJSON.abi,
      this.zbgStakeNetwork.address
    )
    const loomTokenAddress = await this._getLoomTokenAddress()
    this.loomTokenInstance = new this.web3js.eth.Contract(LoomTokenJSON.abi, loomTokenAddress)
    this.zbgSaleInstance = new this.web3js.eth.Contract(
      ZombieBattlegroundSaleJSON.abi,
      this.zbgSaleNetwork.address
    )
  }
  async _getCurrentNetwork() {
    return await this.web3js.eth.net.getId()
  }

  async _getAccounts() {
    return await this.web3js.eth.getAccounts()
  }

  async _getLoomTokenAddress() {
    return await this.zbgStakeInstance.methods.token().call()
  }

  async getTiers() {
    return await this.zbgStakeInstance.methods.getTiers().call()
  }

  async getTiersForSale(amount) {
    return await this.zbgSaleInstance.methods.getTierTypeForLoomTokenValue(amount).call()
  }

  async stakeWithUserId(qtdAuthorized, userId) {
    const amount = await this.zbgStakeInstance.methods
      .stakeWithUserId(qtdAuthorized, userId, Web3.utils.asciiToHex('0'))
      .estimateGas({
        from: this.currentAccount
      })

    return await this.zbgStakeInstance.methods
      .stakeWithUserId(qtdAuthorized, userId, Web3.utils.asciiToHex('0'))
      .send({
        from: this.currentAccount,
        gas: amount
      })
  }

  async stakeLoomToken(qtdAuthorized) {
    return await this.zbgStakeInstance.methods
      .stake(qtdAuthorized, Web3.utils.asciiToHex('0'))
      .send({
        from: this.currentAccount,
        gas: '154830'
      })
  }

  async unstakeLoomToken(qtdAuthorized) {
    return await this.zbgStakeInstance.methods
      .unstake(qtdAuthorized, Web3.utils.asciiToHex('0'))
      .send({
        from: this.currentAccount,
        gas: '154830'
      })
  }

  async approveLoomToken(qtdAuthorized) {
    return await this.loomTokenInstance.methods
      .approve(this.zbgStakeInstance.options.address, qtdAuthorized)
      .send({
        from: this.currentAccount,
        gas: '54830'
      })
  }

  async decreaseApproval(qtdAuthorized) {
    return await this.loomTokenInstance.methods
      .decreaseApproval(this.zbgStakeInstance.options.address, qtdAuthorized)
      .send({
        from: this.currentAccount,
        gas: '44830'
      })
  }

  async getAllowance() {
    return await this.loomTokenInstance.methods
      .allowance(this.currentAccount, this.zbgStakeInstance.options.address)
      .call()
  }

  async getAllowanceOfSale() {
    return await this.loomTokenInstance.methods
      .allowance(this.currentAccount, this.zbgSaleInstance.options.address)
      .call()
  }

  async getStakeHolders() {
    return await this.zbgStakeInstance.methods.stakeHolders(this.currentAccount).call()
  }

  async getStakedValues(address) {
    return await this.zbgStakeInstance.methods.totalStakedFor(address).call()
  }

  async getStakeDetails() {
    return await this.zbgStakeInstance.methods.getStakeDetails(this.currentAccount).call()
  }

  async getCurrentTier(address) {
    return await this.zbgStakeInstance.methods.getCurrentTierFor(address).call()
  }

  async getStakeHolderAddrs(userId) {
    return await this.zbgStakeInstance.methods.stakeHolderAddrs(userId).call()
  }

  async stakeEnabled() {
    return await this.zbgStakeInstance.methods.stakeEnabled().call()
  }

  async checkLockinPeriod() {
    return await this.zbgStakeInstance.methods.checkStakeLockinPeriod().call()
  }

  async buyByEth(ethAmount) {
    return await this.zbgSaleInstance.methods.purchaseWithEther().send({
      from: this.currentAccount,
      value: ethAmount
    })
  }

  async getTierTypesOf() {
    const result = await this.zbgSaleInstance.methods.getTierTypesOf(this.currentAccount).call()
    return result
  }

  async approveLoomForSale(loomTokenAmount) {
    return await this.loomTokenInstance.methods
      .approve(this.zbgSaleInstance.options.address, loomTokenAmount)
      .send({
        from: this.currentAccount
      })
  }

  async unApproveLoomForSale(loomTokenAmount) {
    return await this.loomTokenInstance.methods
      .decreaseApproval(this.zbgSaleInstance.options.address, loomTokenAmount)
      .send({
        from: this.currentAccount
      })
  }

  async buyWithLoom(loomTokenAmount) {
    return await this.zbgSaleInstance.methods.purchaseWithLoomToken(loomTokenAmount).send({
      from: this.currentAccount
    })
  }
}
