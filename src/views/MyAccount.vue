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
                      <div class="col-md-6 deposit-error-container">
                        <span v-if="!metamaskConnected">
                          {{ $t('views.my_account.no_mapping_detected') }}
                        </span>
                      </div>
                    </div>
                  </b-card-header>

                    <b-card-body>
                      <div class="row mt-4 mb-4">
                        <div class="col-md-8 offset-md-2">
                          <!-- Map Accounts -->
                          <div v-if="status != 'mapped'">
                            <div id="map-accounts">
                              <!-- <span class="idx-symbol">{{ $t('views.my_account.1') }}</span> -->
                              <div class="d-flex flex-row align-items-center mb-3">
                                <div class="mx-2" style="width: 250px">
                                  <h5 class="rmv-spacing">{{ $t('views.my_account.connect_to_deposit_funds') }}</h5>
                                </div>
                                <b-button style="width: 160px" variant="primary" @click="addMappingHandler">{{ $t('views.my_account.map_accounts') }}</b-button>                            
                              </div>
                            </div>

                            <hr class="custom-divider">
                          </div>

                          <!-- Allowance -->
                          <!-- <div id="allowance">
                            <div @click="setError(errors['onClickWithNoMapping'])" :class="depositStepClass"></div>
                            <span class="idx-symbol">{{ $t('views.my_account.2') }}</span>
                            <h5 class="rmv-spacing mx-2">{{ $t('views.my_account.approve_amount') }}</h5>
                            <div class="d-flex flex-row align-items-center">                              
                              <div class="mx-2" style="width: 250px">                                
                                <span class="text-small text-gray">{{ $t('views.my_account.allowed_amount_to_deposit') }}</span>
                                <b-form-input :placeholder="'max. ' + mainnetBalance" v-model="amountToApprove" class="w-100"/>
                                <div class="d-flex flex-row justify-content-end">
                                  <b-button class="text-small pt-0" variant="link" @click="amountToApprove=mainnetBalance">{{ $t('views.my_account.use_maximum') }}</b-button>
                                </div>
                              </div>
                              <b-button style="width: 160px" variant="primary" @click="approveAmount(amountToApprove)">{{ $t('views.my_account.approve') }}</b-button>
                            </div>                                                    
                            
                            <div class="d-flex flex-row mb-3">
                              <div class="mx-2" style="width: 250px">
                                <h6 class="rmv-spacing">{{ $t('views.my_account.current_allowance_current_allowance', {currentAllowance0: currentAllowance || 0 }) }}</h6>
                              </div>   
                            </div> 
                          </div> -->

                          <!-- <hr class="custom-divider"> -->

                          <!-- Deposit -->
                          <div id="deposit">
                            <div @click="setError(errors['onClickWithNoMapping'])" :class="depositStepClass"></div>
                            <!-- <span class="idx-symbol">{{ $t('views.my_account.2') }}</span> -->
                            <!-- <h5 class="rmv-spacing mx-2">{{ $t('views.my_account.deposit') }}</h5> -->
                            <div class="d-flex flex-row align-items-center">
                              <div class="mx-2" style="width: 250px">                                
                                <span class="text-small text-gray">{{ $t('views.my_account.transfer_to_plasmachain_for_staking') }}</span>
                                <b-form-input :placeholder="'max. ' + userBalance.mainnetBalance" v-model="transferAmount" class="w-100"/>
                                <div class="d-flex flex-row justify-content-end">
                                  <b-button class="text-small pt-0" variant="link" @click="transferAmount=userBalance.mainnetBalance">{{ $t('views.my_account.use_maximum') }}</b-button>
                                </div>
                              </div>
                              <b-button id="depositBtn" style="width: 160px" variant="primary" @click="depositHandler">{{ $t('views.my_account.deposit') }}</b-button>
                              <b-tooltip v-if="!isLoading" target="depositBtn" placement="right" title="In order to delegate tokens to a choosen validator, you will first need to deposit token onto plasma chain"></b-tooltip>
                            </div>
                          </div>

                          <!-- Withdraw -->
                          <div id="withdraw">
                            <div @click="setError(errors['onClickWithNoMapping'])" :class="depositStepClass"></div>
                            <!-- <span class="idx-symbol">{{ $t('views.my_account.2') }}</span> -->
                            <!-- <h5 class="rmv-spacing mx-2">{{ $t('views.my_account.deposit') }}</h5> -->
                            <div class="d-flex flex-row align-items-center">
                              <div class="mx-2" style="width: 250px">                                
                                <span class="text-small text-gray">{{ $t('views.my_account.withdraw_to_metamask') }}</span>
                                <b-form-input :placeholder="'max. ' + userBalance.loomBalance" v-model="withdrawAmount" class="w-100"/>
                                <div class="d-flex flex-row justify-content-end">
                                  <b-button class="text-small pt-0" variant="link" @click="withdrawAmount=userBalance.loomBalance">{{ $t('views.my_account.use_maximum') }}</b-button>
                                </div>
                              </div>
                              <b-button id="withdrawBtn" style="width: 160px" variant="primary" @click="withdrawHandler">{{ $t('views.my_account.withdraw') }}</b-button>
                              <b-tooltip v-if="!isLoading" target="withdrawBtn" placement="right" title="Click here to withdraw tokens from plasmachain back to your choosen wallet"></b-tooltip>                              
                            </div>
                            <div class="d-flex flex-row align-items-center">

                              <div class="mx-2" style="width: 250px">                                                                
                                <!-- <div>
                                <b-button id="reclaimBtn" style="width: 160px" variant="success" @click="reclaimLoomHandler" :disabled="disabledClaiming">
                                  <fa icon="sync-alt" class="sidebar-icon"/> {{ $t('views.my_account.reclaim') }}
                                </b-button>
                                <b-tooltip v-if="!isLoading" target="reclaimBtn" placement="right" title="Click here to reclaim tokens from plasmachain back to your choosen wallet"></b-tooltip>
                                </div>                               -->
                              </div>
                            </div>

                          </div>
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
import { getBalance, getAddress } from '../services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')
import Web3 from 'web3'

Vue.use(VueClipboard)

@Component({
  components: {
    qrcode: VueQrcode,
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
    FaucetDelegateModal,
    FaucetSidebar,
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
      'connectedToMetamask',
      'currentMetamaskAddress'
    ]),
    ...DappChainStore.mapState([
      'LoomTokenInstance',
      'dAppChainClient'
    ])
  },
  methods: {
    ...mapMutations(['setErrorMsg', 'setSuccessMsg']),
    ...mapActions([
      'setSuccess',
      'setError'
    ]),
    ...DPOSStore.mapActions([
      'checkIfConnected',
      'getValidatorList'
    ]),
    ...DPOSStore.mapMutations([
      'setWeb3',
      'setShowLoadingSpinner',
      'setConnectedToMetamask',
      'setUserBalance'
    ]),
    ...DappChainStore.mapActions([
      'registerWeb3',
      'depositAsync',
      'withdrawAsync',
      'reclaimDeposit',
      'ensureIdentityMappingExists',
      'addMappingAsync',
      'getDappchainLoomBalance',
      'getMetamaskLoomBalance',
      'init',
      'checkMappingCompatability',
      'getDpos2'
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
  disabledClaiming = false

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
  }

  destroyed() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }

  async refresh(poll) {    
    console.log('refreshing...')
    this.userAccount.address = getAddress(localStorage.getItem('privatekey'))
    let loomBalance = await this.getDappchainLoomBalance()    
    let mainnetBalance = await this.getMetamaskLoomBalance({
      web3: this.web3,
      address: this.userEthAddr
    })

    let isLoading = false
    let stakedAmount = this.userBalance.stakedAmount
    await this.getDpos2()
    await this.reclaimLoomHandler()
    this.setUserBalance({
      isLoading,
      loomBalance,
      mainnetBalance,
      stakedAmount
    })
  }

  async initWeb3() {
    
    if(window.ethereum) {
      try {
        await this.connectMetamask()
      } catch(err) {
        this.$refs.metamaskModalRef.show()  
      }
    } else {
      this.$refs.metamaskModalRef.show()
    }
  }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(null, '')
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

  async withdrawHandler() {
    
    if(this.withdrawAmount <= 0) {
      this.setError("Invalid amount")
      return
    }

    this.setShowLoadingSpinner(true)

    try {
      await this.withdrawAsync({amount: this.withdrawAmount})
      this.setSuccess("Withdraw successfull")
    } catch(err) {
      console.error("Withdraw failed, error: ", err)
      this.setError({msg: "Withdraw failed, please try again", err})
    }
    this.withdrawAmount = ""

    this.setShowLoadingSpinner(false)

  }

  async reclaimLoomHandler() {
    try {
      this.disabledClaiming = true
      await this.reclaimDeposit()
    } catch (err) {
      console.error("Error reclaiming tokens", err);
    }
    this.disabledClaiming = false
  }

  async checkAllowance() {    
    if(!this.dposUser) return      
      const user = this.dposUser
      const gateway = user.ethereumGateway
      const address = this.userAccount.address      
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return allowance.toString()
    } catch(err) {
      console.error("Error checking allowance", err)
      return
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
}</script>


<style lang="scss" scoped>

  body {
    overflow-y: scroll;
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
    z-index: 900;
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
