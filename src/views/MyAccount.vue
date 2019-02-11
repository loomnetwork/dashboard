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
                    <a v-b-toggle.accordion1>
                      <h4>
                        <strong>
                          Account Details
                        </strong>
                      </h4>
                    </a>
                  </b-card-header>
                  <b-collapse @shown="initAccordion1" id="accordion1" accordion="my-accordion" role="tabpanel">
                    <b-card-body style="position: relative;">
                      <div class="row mt-4">
                        <loading-spinner v-if="isLoading2" :showBackdrop="true"></loading-spinner>
                        <div class="col mb-4">
                          <h5 class="rmv-spacing"><strong>My Address</strong></h5>
                          <div class="address-container">
                            <span class="text-gray">{{userAccount.address}}</span>
                            <b-button variant="link" @click="copySuccessHandler" v-clipboard:copy="userAccount.address"><fa :icon="['fa', 'copy']" class="text-gray rmv-spacing"/></b-button>
                          </div>                          
                          <div class="balance-container mt-2">
                            <h5><strong>Balance</strong></h5>
                            <h6>Mainnet: <strong>{{userBalance.mainnetBalance + " LOOM"}}</strong></h6>
                            <h6>Plasmachain: <strong>{{userBalance.loomBalance + " LOOM"}}</strong></h6>                            
                          </div>                          
                        </div>
                        <div class="col text-center">
                          <qrcode :value="userAccount.address" :options="{ size: 150 }"></qrcode>
                        </div>                        
                      </div>                      
                      <!-- <hr class="custom-divider">
                      <div class="balance-container">
                        <h5><strong>Balance</strong></h5>
                        <div class="row mt-4 mb-4">                        
                          <div class="col text-center">
                            <h5>Mainnet:</h5>
                            <h1 v-if="metamaskConnected"><strong>{{mainnetBalance}}</strong></h1>
                            <h5><strong>LOOM</strong></h5>
                          </div>
                          <div class="col text-center">
                            <h5>Plasmachain:</h5>
                            <h1><strong>{{parseInt(userAccount.balance)}}</strong></h1>
                            <h5><strong>LOOM</strong></h5>
                          </div>
                        </div>                        
                      </div>                                    -->
                    </b-card-body>
                  </b-collapse>
                </b-card>                
                <b-card no-body class="mb-3">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <div class="row">                   
                      <div class="col-md-6">
                        <a ref="accordion2Toggle" v-if="metamaskConnected" v-b-toggle.accordion2>
                          <h4>
                            <strong>
                              Deposit/Withdraw
                            </strong>                        
                          </h4>
                        </a>
                        <a v-else>
                          <h4>
                            <strong>
                              Deposit/Withdraw
                            </strong>                        
                          </h4>                          
                        </a>                      
                      </div>
                      <div class="col-md-6 deposit-error-container">
                        <span v-if="!metamaskConnected">
                          No mapping detected
                        </span>
                      </div>
                    </div>
                  </b-card-header>
                  <b-collapse @shown="initAccordion2" id="accordion2" :visible="metamaskConnected" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <div class="row mt-4 mb-4">
                        <div class="col-md-8 offset-md-2">
                          <loading-spinner v-if="isLoading" :showBackdrop="true"></loading-spinner>
                          <!-- Map Accounts -->
                          <div v-if="status != 'mapped'">
                            <div id="map-accounts">
                              <!-- <span class="idx-symbol">1</span> -->
                              <div class="d-flex flex-row align-items-center mb-3">
                                <div class="mx-2" style="width: 250px">
                                  <h5 class="rmv-spacing">Connect to deposit funds:</h5>
                                </div>
                                <b-button style="width: 160px" variant="primary" @click="addMappingHandler">Map Accounts</b-button>                            
                              </div>
                            </div>

                            <hr class="custom-divider">
                          </div>

                          <!-- Allowance -->
                          <!-- <div id="allowance">
                            <div @click="setError(errors['onClickWithNoMapping'])" :class="depositStepClass"></div>
                            <span class="idx-symbol">2</span>
                            <h5 class="rmv-spacing mx-2">Approve amount:</h5>
                            <div class="d-flex flex-row align-items-center">                              
                              <div class="mx-2" style="width: 250px">                                
                                <span class="text-small text-gray">Allowed amount to deposit</span>
                                <b-form-input :placeholder="'max. ' + mainnetBalance" v-model="amountToApprove" class="w-100"/>
                                <div class="d-flex flex-row justify-content-end">
                                  <b-button class="text-small pt-0" variant="link" @click="amountToApprove=mainnetBalance">use maximum</b-button>
                                </div>
                              </div>
                              <b-button style="width: 160px" variant="primary" @click="approveAmount(amountToApprove)">Approve</b-button>
                            </div>                                                    
                            
                            <div class="d-flex flex-row mb-3">
                              <div class="mx-2" style="width: 250px">
                                <h6 class="rmv-spacing">Current allowance: {{ currentAllowance || 0 }}</h6>
                              </div>   
                            </div> 
                          </div> -->

                          <!-- <hr class="custom-divider"> -->

                          <!-- Deposit -->
                          <div id="deposit">
                            <div @click="setError(errors['onClickWithNoMapping'])" :class="depositStepClass"></div>
                            <!-- <span class="idx-symbol">2</span> -->
                            <!-- <h5 class="rmv-spacing mx-2">Deposit:</h5> -->
                            <div class="d-flex flex-row align-items-center">
                              <div class="mx-2" style="width: 250px">                                
                                <span class="text-small text-gray">Transfer to Plasmachain for staking</span>
                                <b-form-input :placeholder="'max. ' + mainnetBalance" v-model="transferAmount" class="w-100"/>
                                <div class="d-flex flex-row justify-content-end">
                                  <b-button class="text-small pt-0" variant="link" @click="transferAmount=mainnetBalance">use maximum</b-button>
                                </div>
                              </div>
                              <b-button id="depositBtn" style="width: 160px" variant="primary" @click="depositHandler">Deposit</b-button>
                              <b-tooltip target="depositBtn" placement="right" title="In order to delegate tokens to a choosen validator, you will first need to deposit token onto plasma chain"></b-tooltip>
                            </div>
                          </div>

                          <!-- Withdraw -->
                          <div id="withdraw">
                            <div @click="setError(errors['onClickWithNoMapping'])" :class="depositStepClass"></div>
                            <!-- <span class="idx-symbol">2</span> -->
                            <!-- <h5 class="rmv-spacing mx-2">Deposit:</h5> -->
                            <div class="d-flex flex-row align-items-center">
                              <div class="mx-2" style="width: 250px">                                
                                <span class="text-small text-gray">Withdraw to Metamask</span>
                                <b-form-input :placeholder="'max. ' + userBalance.loomBalance" v-model="withdrawAmount" class="w-100"/>
                                <div class="d-flex flex-row justify-content-end">
                                  <b-button class="text-small pt-0" variant="link" @click="withdrawAmount=userBalance.loomBalance">use maximum</b-button>
                                </div>
                              </div>
                              <b-button id="withdrawBtn" style="width: 160px" variant="primary" @click="withdrawHandler">Withdraw</b-button>
                              <b-tooltip target="withdrawBtn" placement="right" title="Click here to withdraw tokens from plasmachain back to your choosen wallet"></b-tooltip>
                            </div>
                          </div>


                        
                        </div>
                      </div>
                    </b-card-body>
                  </b-collapse>
                </b-card>
                <!-- TODO: Add History page if required -->
                <!-- <b-card no-body class="mb-3">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <a v-b-toggle.accordion3>
                      <h4>
                        <strong>
                          History
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
                  <h1>Delegate</h1>
                  <div class="row mt-4 mb-4">
                    <div class="col">
                      <b-button class="py-2" style="width: 160px" variant="primary" :disabled="userAccount.balance === 0" @click="openRequestDelegateModal">Delegate</b-button>                                  
                    </div>
                  </div>
                </div>
              </div>                    -->                                   
              
            </div>
          </div>
        </main>
      </div>
    </div>
    <b-modal id="metamask-modal" ref="metamaskModalRef" centered :no-close-on-backdrop="true">
      <div slot="modal-header" class="w-100">
        <h4 class="text-center">
          Connection Error
        </h4>
      </div>
      <div class="d-block text-center pb-4 pt-4 pr-2 pl-2">
        <h5 class="mb-4">Please connect to Metamask to proceed</h5>
        <b-btn variant="outline-danger" block @click="connectFromModal">Connect</b-btn>
      </div>
      <div slot="modal-footer" class="w-100 text-center">
        <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" class="metamask-link">Click here to download Metamask</a>
      </div>   
    </b-modal>    
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
      'currentMetmaskAddress'
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
      'setConnectedToMetamask'
    ]),
    ...DappChainStore.mapActions([
      'registerWeb3',
      'depositAsync',
      'withdrawAsync',
      'ensureIdentityMappingExists',
      'addMappingAsync',
      'getDappchainLoomBalance',
      'getMetamaskLoomBalance',
      'init',
      'checkMappingCompatability'
    ])
  }
})
export default class MyAccount extends Vue {
  userAccount = {
    address: "",
    balance: 0,
  }

  mainnetBalance = 0
  transferAmount = ""
  amountToApprove = ""
  withdrawAmount = ""
  currentAllowance = 0

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
    this.refreshInterval = setInterval(() => this.refresh(false), 5000)
  }

  destroyed() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }

  async refresh(poll) {    
    if(poll) this.isLoading2 = true
    this.userAccount.address = getAddress(localStorage.getItem('privatekey'))
    this.userAccount.balance = await this.getDappchainLoomBalance()    
    this.mainnetBalance = await this.getMetamaskLoomBalance({
      web3: this.web3,
      address: this.userEthAddr
    })
    if(poll) this.isLoading2 = false
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

    this.isLoading = true
    
    try {
      await this.depositAsync({amount: this.transferAmount})
      this.setSuccess("Deposit successfull")
    } catch(err) {
      this.$log(err)
      this.setError("Deposit failed, please try again")
    }
    this.transferAmount = ""
    this.isLoading = false
  }

  async withdrawHandler() {
    
    if(this.withdrawAmount <= 0) {
      this.setError("Invalid amount")
      return
    }

    this.isLoading = true

    try {
      await this.withdrawAsync({amount: this.withdrawAmount})
      this.setSuccess("Withdraw successfull")
    } catch(err) {
      this.$log(err)
      this.setError("Withdraw failed, please try again")
    }
    this.withdrawAmount = ""
    this.isLoading = false

  }

  async initAccordion1() {
    this.refresh(true)
  }

  async initAccordion2() {
    this.currentAllowance = await this.checkAllowance()
  }


  async checkAllowance() {    
    if(!this.dposUser) return      
      const user = this.dposUser
      const gateway = user.ethereumGateway
      const address = this.userAccount.address      
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetmaskAddress, gateway.address)
      return allowance.toString()
    } catch(err) {
      console.log(err)
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
      console.log(err)
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
      console.log(err)
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
    } catch (e) {
      console.log(e)
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
