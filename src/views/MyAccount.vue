<template>
  <div class="faucet-with-navbar">    
    <div class="faucet-content">
      <div>
        <main>
          <faucet-delegate-modal ref="delegateModalRef"></faucet-delegate-modal>
          <div class="container mb-5">
            <div class="column py-5 p-3 d-flex">
              <div role="tablist" id="accordion">
                <b-card no-body class="mb-3">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <a>
                      <h4>
                        <strong>
                          {{ $t('views.my_account.account_details') }}
                        </strong>
                      </h4>
                    </a>
                  </b-card-header>

                    <b-card-body style="position: relative;">
                      <div class="row mt-4">
                        <div class="col mb-4">
                          <h5 class="rmv-spacing" style="display:none"><strong>{{ $t('views.my_account.my_address') }}</strong></h5>
                          <div class="address-container"  style="display:none">
                            <span class="text-gray">{{userAccount.address}}</span>
                            <b-button variant="link" @click="copySuccessHandler" v-clipboard:copy="userAccount.address"><fa :icon="['fa', 'copy']" class="text-gray rmv-spacing"/></b-button>
                          </div>                          
                          <div class="balance-container mt-2">
                            <h5><strong>{{ $t('views.my_account.balance') }}</strong></h5>
                            <h6>{{ $t('views.my_account.mainnet') }} <strong>{{userBalance.isLoading ? 'loading' : userBalance.mainnetBalance + " LOOM"}}</strong></h6>
                            <div v-if="currentAllowance && !gatewayBusy"><small ><fa icon="fa exclamation-triangle"/> {{currentAllowance}} LOOM out of mainnet balance awaiting transfer to plasmachain account</small> <b-btn size="sm" variant="outline-primary" style="display: inline-block;margin-left: 12px;" @click="completeDeposit">resume deposit</b-btn></div>                        
                            <h6>{{ $t('views.my_account.plasmachain') }} <strong>{{userBalance.isLoading ? 'loading' : userBalance.loomBalance + " LOOM"}}</strong></h6>                            
                          </div>                          
                        </div>
                        <div class="col text-center" style="display:none">
                          <qrcode :value="userAccount.address" :options="{ size: 150 }"></qrcode>
                        </div>                        
                      </div>                      
                      <!-- <hr class="custom-divider">
                      <div class="balance-container">
                        <h5><strong>{{ $t('views.my_account.balance') }}</strong></h5>
                        <div class="row mt-4 mb-4">                        
                          <div class="col text-center">
                            <h5>{{ $t('views.my_account.mainnet') }}</h5>
                            <h1 v-if="metamaskConnected"><strong>{{mainnetBalance}}</strong></h1>
                            <h5><strong>{{ $t('views.my_account.loom') }}</strong></h5>
                          </div>
                          <div class="col text-center">
                            <h5>{{ $t('views.my_account.plasmachain') }}</h5>
                            <h1><strong>{{parseInt(userAccount.balance)}}</strong></h1>
                            <h5><strong>{{ $t('views.my_account.loom') }}</strong></h5>
                          </div>
                        </div>                        
                      </div>                                    -->
                    </b-card-body>

                </b-card>                
                <b-card no-body class="mb-3">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <div class="row">                   
                      <div class="col-md-6">
                        <a ref="accordion2Toggle">
                          <h4>
                            <strong>
                              {{ $t('views.my_account.deposit_withdraw') }}
                            </strong>                        
                          </h4>
                        </a>                     
                      </div>
                    </div>
                  </b-card-header>

                    <b-card-body>
                      <div class="row mt-4 mb-4">
                        <div style="width:100%">
                          <b-card no-body v-if="metamaskConnected">
                            <b-tabs card>
                              <b-tab title="Deposit" v-if="!oracleEnabled" active>
                                Plasmachain wallet is undergoing scheduled upgrades... Please check back in 1-2 hours.
                              </b-tab>
                              <b-tab title="Deposit" v-if="userBalance.mainnetBalance > 0 && oracleEnabled" active>
                                <TransferStepper 
                                  :balance="userBalance.mainnetBalance" 
                                  :transferAction="approveDeposit"
                                  :resolveTxSuccess="executeDeposit"
                                  >
                                  <template #pendingMessage><p>Please approve deposit on your wallet...</p></template>
                                  <template #failueMessage><p>Approval failed.</p></template>
                                  <template #confirmingMessage>Please confirm deposit on your wallet. Depositing as soon as approval is confirmed: </template>
                                </TransferStepper>
                              </b-tab>
                              
                              <b-tab title="Withdraw" v-if="oracleEnabled && (userBalance.loomBalance > 0 || unclaimWithdrawTokensETH > 0 || unclaimDepositTokens > 0)">
                                <template slot="title">
                                  <span class="tab-title">Withdraw</span>
                                  <fa icon="info-circle" v-if="unclaimWithdrawTokensETH > 0 || unclaimDepositTokens > 0" class="tab-icon text-red"/>
                                </template>
                                <p>Please note that withdrawal is subject to a daily limit of 500k LOOM. You have {{withdrawLimit}} allowance left.</p>

                                <TransferStepper v-if="unclaimWithdrawTokensETH == 0 && unclaimDepositTokens == 0"
                                  @withdrawalDone="afterWithdrawalDone"
                                  @withdrawalFailed="afterWithdrawalFailed"
                                  :balance="Math.min(userBalance.loomBalance,withdrawLimit)" 
                                  :transferAction="executeWithdrawal"
                                  :resolveTxSuccess="resolveWithdraw"
                                  executionTitle="Execute transfer">
                                    <template #pendingMessage><p>Transfering funds from plasma chain to your ethereum account...</p></template>
                                    <template #failueMessage>Withdrawal failed... retry?</template>
                                    <template #confirmingMessage>Waiting for ethereum confirmation</template>
                                </TransferStepper>
                                <!-- <div v-if="unclaimDepositTokens > 0 && !gatewayBusy">
                                <p> {{$t('views.my_account.tokens_pending_deposit',{pendingDepositAmount:unclaimDepositTokens} )}} </p>
                                <b-btn variant="outline-primary" @click="reclaimDepositHandler">{{$t('views.my_account.reclaim_deposit')}} </b-btn>
                                </div> -->
                                <div v-if="unclaimWithdrawTokensETH > 0 && !gatewayBusy">
                                <p> {{$t('views.my_account.tokens_pending_withdraw',{pendingWithdrawAmount:unclaimWithdrawTokensETH} )}} </p><br>
                                <div class="center-children">                                  
                                  <b-btn variant="outline-primary" @click="reclaimWithdrawHandler" :disabled="isWithdrawalInprogress"> {{$t('views.my_account.complete_withdraw')}} </b-btn>
                                  <b-spinner v-if="isWithdrawalInprogress" variant="primary" label="Spinning" small/>
                                </div>                                
                                </div>
                              </b-tab>
                            </b-tabs>
                          </b-card>
                          <b-modal id="wait-tx" title="Done" hide-footer centered no-close-on-backdrop> 
                            {{ $t('views.my_account.wait_tx') }}
                          </b-modal> 
                          <b-modal id="unclaimed-tokens" title="Unclaimed Tokens" hide-footer centered no-close-on-backdrop> 
                            <p> {{$t('views.my_account.tokens_pending_deposit',{pendingDepositAmount:unclaimDepositTokens} )}} </p>
                            <b-btn variant="outline-primary" @click="reclaimDepositHandler">{{$t('views.my_account.reclaim_deposit')}} </b-btn>
                          </b-modal>                           
                        </div>
                      </div>
                    </b-card-body>
                </b-card>
                <!-- TODO: Add History page if required -->
                <!-- <b-card no-body class="mb-3">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <a v-b-toggle.accordion3>
                      <h4>
                        <strong>
                          {{ $t('views.my_account.history') }}
                        </strong>                        
                      </h4>
                    </a>              
                  </b-card-header>
                  <b-collapse id="accordion3" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <div class="row">
                        <div class="col">
                          <faucet-table v-if="metamaskConnected" :items="history"></faucet-table>
                          <faucet-table v-else :items="emptyHistory"></faucet-table>                     
                        </div>
                      </div>
                    </b-card-body>
                  </b-collapse>
                </b-card>                 -->
              </div>

              <!-- <div class="d-flex bottom-border justify-content-between w-100 p-4">
                <div class="column d-flex justify-content-between w-100 balance-container">
                  <h1>{{ $t('views.candidate_detail.delegate') }}</h1>
                  <div class="row mt-4 mb-4">
                    <div class="col">
                      <b-button class="py-2" style="width: 160px" variant="primary" :disabled="userAccount.balance === 0" @click="openRequestDelegateModal">{{ $t('views.candidate_detail.delegate') }}</b-button>                                  
                    </div>
                  </div>
                </div>
              </div>                    -->                                   
              
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
 
</template>

<script>
import Vue from 'vue'
import VueQrcode from '@xkeshi/vue-qrcode';
import VueClipboard from 'vue-clipboard2'
import ApiClient from '../services/faucet-api'
import { Component, Watch } from 'vue-property-decorator'
import FaucetTable from '../components/FaucetTable'
import FaucetSidebar from '../components/FaucetSidebar'
import FaucetHeader from '../components/FaucetHeader'
import FaucetFooter from '../components/FaucetFooter'
import LoadingSpinner from '../components/LoadingSpinner'
import FaucetDelegateModal from '../components/modals/FaucetDelegateModal'
import TransferStepper from '../components/TransferStepper'
import { getBalance, getAddress } from '../services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

import Web3 from 'web3'
import BN from 'bn.js'
import debug from 'debug'
import { setTimeout } from 'timers';

// should move this
Vue.use(VueClipboard)

const log = debug('myaccount')
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')


@Component({
  components: {
    qrcode: VueQrcode,
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
    FaucetDelegateModal,
    FaucetSidebar,
    TransferStepper,
    LoadingSpinner
  },
  computed: {
    ...DappChainStore.mapState([
      'web3',
      'dposUser',
      'mappingStatus',
      'mappingError'
    ]),
    ...mapGetters([
      'getPrivateKey'
    ]),
    ...DPOSStore.mapState([
      'status',
      'userBalance',
      'gatewayBusy',
      'connectedToMetamask',
      'currentMetamaskAddress',
      'withdrawLimit',
    ]),
    ...DappChainStore.mapState([
      'LoomTokenInstance',
      'dAppChainClient'
    ]),
    withdrewSignature: function() {
      let signature = sessionStorage.getItem('withdrewSignature')
      return signature
    }
  },
  methods: {
    ...mapMutations(['setErrorMsg', 'setSuccessMsg']),
    ...mapActions([
      'setSuccess',
      'setError'
    ]),
    ...DPOSStore.mapActions([
      'checkIfConnected',
    ]),
    ...DPOSStore.mapMutations([
      'setWeb3',
      'setShowLoadingSpinner',
      'setConnectedToMetamask',
      'setGatewayBusy',
      'setUserBalance'
    ]),
    ...DappChainStore.mapMutations([
      'setWithdrewSignature',
    ]),
    ...DappChainStore.mapActions([
      'registerWeb3',
      'depositAsync',
      'withdrawAsync',
      'ensureIdentityMappingExists',
      'addMappingAsync',
      'getDappchainLoomBalance',
      'getMetamaskLoomBalance',
      'getAccumulatedStakingAmount',
      'init',
      'checkMappingCompatability',
      'getDpos2',
      'getUnclaimedLoomTokens',
      'reclaimDeposit',
      'getPendingWithdrawalReceipt',
      'withdrawCoinGatewayAsync',
      'switchDposUser'
    ])
  }
})
export default class MyAccount extends Vue {
  userAccount = {
    address: "",
  }
  transferAmount = ""
  amountToApprove = ""
  withdrawAmount = ""
  currentAllowance = 0
  unclaimDepositTokens = 0
  unclaimWithdrawTokens = 0
  unclaimWithdrawTokensETH = 0
  unclaimSignature = ""
  oracleEnabled = true
  receipt = null
  isWithdrawalInprogress = false

  emptyHistory = [
  {
    ID: " ",
    Date: " ",
    Amount: " ",
    To: " ",
    From: " "
  },
  {
    ID: " ",
    Date: " ",
    Amount: " ",
    To: " ",
    From: " "
  },
  {
    ID: " ",
    Date: " ",
    Amount: " ",
    To: " ",
    From: " "
  },
  ]

  history = [
    {
      ID: 2349134,
      Date: "3/14/18",
      Amount: "10000 LOOM",
      To: "trdzvzr7...",
      From: "Me"
    },
    {
      ID: 2349134,
      Date: "3/14/18",
      Amount: "10000 LOOM",
      To: "trdzvzr7...",
      From: "Me"
    },
    {
      ID: 2349134,
      Date: "3/14/18",
      Amount: "10000 LOOM",
      To: "trdzvzr7...",
      From: "Me"
    }
  ]

  refreshInterval = null
  userEthAddr = null

  isLoading = false
  isLoading2 = false
  
  errors = {
    onClickWithNoMapping: "No mapping detected, please click \"Map Accounts\" or refresh the page"
  }

  async mounted() {
    await this.refresh(true)
    this.currentAllowance = await this.checkAllowance()
    await this.checkUnclaimedLoomTokens()
    await this.checkPendingWithdrawalReceipt()

    this.$root.$on('done', async () => {
      this.refresh()
    })
    
    if (this.receipt) {
      this.hasReceiptHandler(this.receipt)
    }

  }

  async refresh(poll) {    
    this.$emit('refreshBalances') 
  }

  destroyed() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(null, '')
  }

  async checkUnclaimedLoomTokens() {
    let unclaimAmount = await this.getUnclaimedLoomTokens()
    this.unclaimDepositTokens = unclaimAmount.toNumber()
    if(this.unclaimDepositTokens > 0) this.$root.$emit("bv::show::modal", "unclaimed-tokens")
  }

  async afterWithdrawalDone () {
    this.$root.$emit("bv::show::modal", "wait-tx")
    this.$emit('refreshBalances')
    await this.checkPendingWithdrawalReceipt()
    if(this.receipt){
      this.setWithdrewSignature(this.receipt.signature)
      this.unclaimSignature = this.receipt.signature
      this.unclaimWithdrawTokensETH = 0
    }
    await this.refresh(true)
  }

  async afterWithdrawalFailed () {
    await this.checkPendingWithdrawalReceipt()
    if(this.receipt) {
      this.unclaimWithdrawTokensETH = this.web3.utils.fromWei(this.receipt.amount.toString())
      this.unclaimSignature = this.receipt.signature
    }
    await this.refresh(true)
  }

  async reclaimDepositHandler() {
    let result = await this.reclaimDeposit()
    this.$root.$emit("bv::hide::modal", "unclaimed-tokens")
    this.$root.$emit("bv::show::modal", "wait-tx")
    await this.refresh(true)
  }

  async checkPendingWithdrawalReceipt() {
    this.receipt = await this.getPendingWithdrawalReceipt()
  }

  async hasReceiptHandler(receipt) {
    if(receipt.signature && (receipt.signature != this.withdrewSignature)) {
      // have pending withdrawal
      this.unclaimWithdrawTokens = receipt.amount
      this.unclaimWithdrawTokensETH = this.web3.utils.fromWei(receipt.amount.toString())
      this.unclaimSignature = receipt.signature
    } else if (receipt.amount) {
      // signature, amount didn't get update yet. need to wait for oracle update
      this.setErrorMsg('Waiting for withdrawal authorization.  Please check back later.')
    }
    let ethAddr = this.dposUser._wallet._address
    // TODO: This is to handle a specific bug, once all users are fixed, remove this. 
    if (receipt.tokenOwner.toLowerCase() != ethAddr.toLowerCase()) {
      this.mismatchedReceiptHandler(receipt, ethAddr)
    }
  }

  async mismatchedReceiptHandler(receipt, ethAddr) {
    // this is necessary to prevent reloading when metamask changes accounts
    window.resolvingMismatchedReceipt = true

    console.log('receipt: ', receipt.tokenOwner)
    console.log('mapped address:', ethAddr)

    let r = confirm(`A pending withdraw requires you to switch ETH accounts to: ${receipt.tokenOwner}. Please change your account and then click OK`)
    if (r) {
      let tempUser = await this.switchDposUser({web3: window.web3})
      this.reclaimWithdrawHandler()
    }
  }

  async reclaimWithdrawHandler() {
    // var localAddr = CryptoUtils.bytesToHexAddr(this.dposUser._address.local.bytes)
    // let mappedAddr = await this.dposUser._wallet._address
    // let ethAddr = CryptoUtils.bytesToHexAddr(mappedAddr.to.local.bytes)
    let ethAddr = this.dposUser._wallet._address
    console.log('current eth addr: ', ethAddr)
    try {
      this.isWithdrawalInprogress = true
      let tx = await this.withdrawCoinGatewayAsync({amount: this.unclaimWithdrawTokens, signature: this.unclaimSignature})      
      await tx.wait()
      this.$root.$emit("bv::show::modal", "wait-tx")
      this.isWithdrawalInprogress = false
      await this.checkPendingWithdrawalReceipt()
      if(this.receipt){
        this.setWithdrewSignature(this.receipt.signature)
        this.unclaimSignature = this.receipt.signature
      }
      this.unclaimWithdrawTokensETH = 0
      await this.refresh(true) 

      // TODO: this is added for fixing mismatched receipts, remove once users are fixed. 
      if (window.resolvingMismatchedReceipt) {
        alert('Pending withdraw is fixed. Please log in again to switch back to the correct account.')
        window.location.reload(true)
      }
    } catch (err) {
      this.setErrorMsg(err.message)
      console.error(err)
      this.isWithdrawalInprogress = false
    }
  }

  async connectFromModal() {
    try {
      await this.connectMetamask()
    } catch(err) {
      this.setError(err)
    }
    this.$refs.metamaskModalRef.hide()
  }

  async depositHandler() {

    if(this.transferAmount <= 0) {
      this.setError("Invalid amount")
      return
    }

    this.setShowLoadingSpinner(true)
    
    try {
      await this.depositAsync({amount: this.transferAmount})
      this.setSuccess("Deposit successfull")
    } catch(err) {
      console.error("Deposit failed, error: ", err)
      this.setError({msg: "Deposit failed, please try again", err})
    }
    this.transferAmount = ""

    this.setShowLoadingSpinner(false)
    
  }

  async checkAllowance() {    
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")   
    const user = this.dposUser
    const gateway = user.ethereumGateway
    const address = this.userAccount.address    
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return parseInt(this.web3.utils.fromWei(allowance.toString()))
    } catch(err) {
      console.error("Error checking allowance", err)
      return ''
    }
  }

  async approveAmount(amount) {
    if(!this.dposUser) return
    const user = this.dposUser
    const gateway = user.ethereumGateway
    try {
      let tx = await user.ethereumLoom.approve(gateway.address, amount)
      await tx.wait()
      this.currentAllowance = await this.checkAllowance()
      this.setSuccess("Amount approved")
    } catch(err) {
      console.error("Error approving amount", err)
      return
    }    
  }

  async connectMetamask() {
    let web3js
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      web3js = new Web3(ethereum)
      try {
        await ethereum.enable();
      } catch (err) {
        this.setErrorMsg("User denied access to Metamask")
        console.error(err)
        return
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      web3js = new Web3(window.web3.currentProvider)
    } else {
      this.setErrorMsg('Metamask is not Enabled')
    }
    
    if (web3js) {
      this.setWeb3(web3js)
      const accounts = await web3js.eth.getAccounts()
      if (!accounts || accounts.length < 1) {
        this.userEthAddr = null
        this.setErrorMsg('Please login Metamask')
      } else {
        this.userEthAddr = accounts[0]                        
        await this.registerWeb3({ web3: web3js })
        this.setConnectedToMetamask(true)        
        this.isLoading = true
        await this.checkMapping()
        this.isLoading = false
      }
    }
  }


  copySuccessHandler() {
    this.setSuccessMsg("Address copied!")
  }


  async checkMapping() {
    const mapped = await this.ensureIdentityMappingExists()
    if(mapped) {
      this.status = this.STATUS['mapped']
    } else {
      this.status = this.STATUS['no_mapping']
    }  
  }

  async addMappingHandler() {
    this.isLoading = true
    try {
      await this.addMappingAsync()
    } catch(err) {
      console.error(err)
      this.isLoading = false
      return
    }
    this.isLoading = false
  }

  async transferToPlasmaChain() {
    if (!this.metamaskConnected) {
      console.log('Connect Metamask first!')
      return
    }
    if (this.status = this.STATUS['no_mapping']) {
      await this.addMappingAsync()
    }
    try {
      await this.depositAsync({
        amount: this.transferAmount.toString()
      })
    } catch (err) {
      console.error("Error transferring to plasma chain: ", err)
    }
  }

  get metamaskConnected() {    
    return !!this.connectedToMetamask
  }

  get canTransfer() {
    return this.dAppChainClient && this.mainnetBalance > 0
  }

  get depositStepClass() {
    return this.status !== 'mapped' ? 'dd-overlay' : ''
  }

  get STATUS() {
    return {
      check_mapping: 'check_mapping',
      mapped: 'mapped',
      no_mapping: 'no_mapping'
    }
  }

  get mapButtonTitle() {
    if (this.status === this.STATUS['check_mapping']) {
      return 'checking mapping...'
    } else if (this.status === this.STATUS['no_mapping']) {
      return 'Add Mapping'
    } else {
      return 'Transfer'
    }
  }


  async approveDeposit(amount) {
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")
    const { web3, dposUser} = this
    const ethereumLoom  = dposUser.ethereumLoom
    const ethereumGateway  = dposUser._ethereumGateway
    const tokens = new BN( "" + parseInt(amount,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    log('approve', ethereumGateway.address, weiAmount.toString(), weiAmount)
    this.setGatewayBusy(true)
    log('approve', ethereumGateway.address, weiAmount.toString())
    const approval = await ethereumLoom.functions.approve(
            ethereumGateway.address,
            weiAmount.toString())

    //const receipt = await approval.wait()
    log('approvalTX', approval)
    // we still need to execute deposit so keep gatewayBusy = true
    return approval
  }

  async executeDeposit(amount,approvalTx) {
    console.assert(this.dposUser, "Expected dposUser to be initialized")
    console.assert(this.web3, "Expected web3 to be initialized")
    this.setGatewayBusy(true)
    await approvalTx.wait()
    const tokens = new BN( "" + parseInt(amount,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    let result = await this.dposUser._ethereumGateway.functions.depositERC20(
      weiAmount.toString(), this.dposUser.ethereumLoom.address
    )
    this.setGatewayBusy(false)
    this.$emit('refreshBalances')
    return result
  }

  async completeDeposit() {
    this.setGatewayBusy(true)
    this.setShowLoadingSpinner(true)
    const tokens = new BN( "" + parseInt(this.allowance,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    try {
      await this.dposUser._ethereumGateway.functions.depositERC20(
        weiAmount.toString(), this.dposUser.ethereumLoom.address
      )
      this.allowance = 0
    } catch (error) {
      console.error(error)
    }
    this.$emit('refreshBalances')
    this.setGatewayBusy(false)
    this.setShowLoadingSpinner(false)

  }

  async executeWithdrawal(amount) {
    // return new Promise((resolve,reject) => setTimeout(() => resolve({hash:'0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'}),5000))
    // note:  withdrawAsync returns Promise<TransactionReceipt> 
    try {
      await this.checkPendingWithdrawalReceipt()
      if (this.receipt) {
        // have a pending receipt
        this.hasReceiptHandler(this.receipt)
        return
      } else {
        let tx = await this.withdrawAsync({amount})
        //await tx.wait()
        return tx
      }
    } catch (e) {
      console.error(e)
    }
  }

  resolveWithdraw(amount, tx) {
    return tx.wait()
  }
}
</script>


<style lang="scss" scoped>

  body {
    overflow-y: scroll;
  }

  .text-red {
    color: #dc3545;
  }

  .custom-divider {
    margin-top: 36px;
    margin-bottom: 36px;
    border-width: 2px;
    border-color: #f2f1f3;
  }

  .address-container {
    display: flex;
    flex-direction: row;
    align-items: center;    
    span {
      max-width: 300px;
      display: inline-block;
      overflow: scroll;
      white-space: nowrap;
    }
  }  

  #accordion {
    .card {
      border: 2px solid #f2f1f3 !important;
    }
    .card-header {
      background-color: #ffffff;
      h4 {
        color: gray;
        margin: 0px;
        padding: 12px 1.25rem;
        &:hover {
          color: #f0ad4e;
        }
      }
    }
    .card-body {
      h3 {
        color: gray !important;
      }
    }    
  }
  
  .deposit-error-container {
    align-items: center;
    display: flex;
    justify-content: space-around;
    span {
      color: #e62e2e;
      font-size: 14px;
    }    
  }

  #map-accounts, #allowance, #deposit, #withdraw {
    position: relative;
    .idx-symbol {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      color: #ffffff;
      font-weight: bold;
      background-color: #f0ad4e;
      border-radius: 50%;
      top: 50%;
      left: -52px;
      transform: translateY(-50%);
    }
  }  

  .dd-overlay {
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    width: 100%;
    height: 100%;
    z-index: 190;
    background-color: #ffffff;
    opacity: 0.5;
  }

  .disabled-overlay {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    justify-content: center;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(255,255,255,0.8);    
    z-index: 9999;
    text-align: center;
    h4 {
      color: #eb2230 !important;
      margin-bottom: 6px;
    }
    .address {
      color: #5756e6;
      background-color: #ffd1de;
      border-radius: 3px;
      padding: 3px 6px;
      font-weight: bold;
    }
    .network-error-container {
      width: 180px;
      height: 180px;
      margin: 0 auto;
      overflow: hidden;
      border: 4px solid #5756e6;
      border-radius: 50%;
      background: rgb(238,174,202);
      background: radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);   
      img {      
        height: 180px;
      }
    }
  }

  .center-children {
    display: flex;
    align-items: center;
    button {
      margin-right: 12px;
    }
  }

</style>

<style lang="scss">
@import url('https://use.typekit.net/nbq4wog.css');

$theme-colors: (
  //primary: #007bff,
  primary: #02819b,
  secondary: #4bc0c8,
  success: #5cb85c,
  info: #5bc0de,
  warning: #f0ad4e,
  danger: #d9534f,
  light: #f0f5fd,
  dark: #122a38
);

.faucet-with-navbar {
  main {
    min-height: 620px;
    .bottom-border {
      border-bottom: 2px solid #f2f1f3;
    }
  }
  #metamask-modal {
    .modal-content {
      h5 {
        color: #333333;
      }
      button {
        max-width: 240px;
        margin: 0 auto;
      }
      .modal-header {
        h4 {
          color: #333333;
        }
      }
    }    
  }
  .faucet-content {
    color: gray;
    .column {
      flex-direction: column;
    }
    h4, h1 {
      color: gray;
    }
    .text-gray {
      color: gray;
    }
    .text-small {
      font-size: 10px;
    }
  }

  .metamask-link {
    text-decoration: underline;
    font-size: 14px;
  }

  .balance-container {
    h5 {
      color: gray;
      font-size: 22px;
      margin-bottom: 6px;
    }

    h6 {
      strong {          
        color: #f0ad4e;
      }
    }
  }

}

</style>
