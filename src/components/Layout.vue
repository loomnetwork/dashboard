<template>
  <div id="layout" class="d-flex flex-column" :class="getClassNameForStyling">        
    <!-- <faucet-header v-on:update:chain="refresh()" @onLogin="onLoginAccount"></faucet-header> -->
    <faucet-header v-on:update:chain="refresh()"></faucet-header>    
    <div class="content container-fluid">      
      <warning-overlay type="metamask"></warning-overlay>
      <warning-overlay type="mapping"></warning-overlay>
      <div class="row">
        <div v-show="showSidebar" class="col-lg-3">
          <faucet-sidebar></faucet-sidebar>      
        </div>
        <div :class="contentClass">
          <b-modal id="sign-wallet-modal"  title="Sign Your wallet" hide-footer centered no-close-on-backdrop> 
              On your {{walletType}}, Sign the message to confirm your Ethereum identity. (No gas required)
          </b-modal>
          <b-modal id="already-mapped" title="Account Mapped" hide-footer centered no-close-on-backdrop> 
              Your selected accout is already mapped. Please select new account.
          </b-modal> 
          <loading-spinner v-if="showLoadingSpinner" :showBackdrop="true"></loading-spinner>
          <router-view></router-view>
        </div>        
      </div>          
    </div>    
    <faucet-footer></faucet-footer>
  </div>  
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapActions, mapMutations, mapState, createNamespacedHelpers } from 'vuex'

import FaucetHeader from '@/components/FaucetHeader'
import FaucetSidebar from '../components/FaucetSidebar'
import FaucetFooter from '@/components/FaucetFooter'
import LoadingSpinner from '../components/LoadingSpinner'
import WarningOverlay from '../components/WarningOverlay'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

import { initWeb3 } from '../services/initWeb3'
import { isIP } from 'net';

@Component({
  components: {
    FaucetHeader,
    FaucetSidebar,
    FaucetFooter,
    LoadingSpinner,
    WarningOverlay
  },
  props: {
    data: Object,
  },
  methods: {
    ...mapMutations([
      'setUserIsLoggedIn',
      'setErrorMsg'
    ]),
    ...DappChainStore.mapActions([
      'ensureIdentityMappingExists'
    ]),
    ...DPOSStore.mapActions([
      'initializeDependencies',
      'checkMappingAccountStatus'
    ]),
    ...DPOSStore.mapMutations([
      'setConnectedToMetamask',
      'setCurrentMetamaskAddress'      
    ]),
    ...DappChainStore.mapMutations([
      'setMappingError',
      'setMappingStatus'
    ])    
  },  
  computed: {
    ...mapState([
      'userIsLoggedIn'
    ]),
    ...DappChainStore.mapState([
      'account',
      'metamaskStatus',
      'metamaskError',
      'mappingStatus',
      'mappingError'
    ]),
    ...DPOSStore.mapState([
      'showSidebar',
      'web3',
      'metamaskDisabled',
      'showLoadingSpinner',
      'showAlreadyMappedModal',
      'showSignWalletModal',
      'mappingSuccess',
      'isLoggedIn',
      'walletType',
      'status'
    ])    
  },
})

export default class Layout extends Vue {  
  pendingModalTitle = 'Continue with your approved Loom'
  isOpen = true
  preload = false
  loginEmail = ''
  routeArray = [
    {
      'className': 'dark-bg',
      'routeNames': [ 'Open Pack']
    },
    {
      'className': 'gradient-bg',
      'routeNames': ['browse', 'Browse Type', 'card detail', 'trade history', 'Account',
                  , 'Early Backer Sale Packages', 'Package Detail', 'Cards in Sale',
                  'Confirmed Package Purchase', 'Card Pack',]
    },
    {
      'className': 'image-bg',
      'routeNames': ['My Cards', 'My Packs',  'trading', 'landing', 'overlords', 'cards', 'redeemSubmitted',  'How To Play']
    }
  ]

  created() {
    this.$router.beforeEach((to, from, next) => {
      this.$Progress.start()
      next()
    })
    this.$router.afterEach((to, from) => {
      this.$Progress.finish()
    })
  }

  beforeMount() {
    if(localStorage.getItem("privatekey")) {
      this.setUserIsLoggedIn(true)
    }
  }

  @Watch('mappingSuccess')
    onMappingSuccessChange(newValue, oldValue) {
    if(newValue && this.walletType === 'metamask') {
      this.$router.push({
        name: 'account'
      })
    }
  }

  @Watch('status')
    onMappedChange(newValue, oldValue) {
    if(newValue === 'mapped' && this.walletType === 'metamask') {
      this.$router.push({
        name: 'account'
      })
    }
  }

  @Watch('showAlreadyMappedModal')
    onAlreadyMappedModalChange(newValue, oldValue) {
    if(newValue) {
        this.$root.$emit("bv::show::modal", "already-mapped")
    } else {
        this.$root.$emit("bv::hide::modal", "already-mapped")

    }
  }

  @Watch('showSignWalletModal')
    onSignLedgerModalChange(newValue, oldValue) {      
    if(newValue) {
        this.$root.$emit("bv::show::modal", "sign-wallet-modal")
    } else {
        this.$root.$emit("bv::hide::modal", "sign-wallet-modal")

    }
  }

  async mounted() {

    if(this.$route.meta.requireDeps) {
      this.attemptToInitialize()     
    } else {
      this.$root.$on('login', async () => {
        this.attemptToInitialize()
      })
    }      
    
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if(this.userIsLoggedIn) this.ensureIdentityMappingExists({currentAddress: accounts[0]})
        this.setCurrentMetamaskAddress(accounts[0])
        this.checkMappingAccountStatus()
        if (!this.mappingSuccess) {
          this.$root.$emit("logout")
          this.setMappingError(null)
          this.setMappingStatus(null)
        }
      })
    }

  }

  async attemptToInitialize() {
    try {
      await this.initializeDependencies()
      this.$root.$emit("initialized")
    } catch(err) {
      this.$root.$emit("logout")
      this.setMappingError(null)
      this.setMappingStatus(null)
    }           
  }

  onLoginHandler() {
    this.$auth.initAuthInstance()
  }

  get showErrorMsg() {
    return this.$store.state.errorMsg ? { message: this.$store.state.errorMsg, variant: 'error' } : false
  }

  get showSuccessMsg() {
    return this.$store.state.successMsg ? { message: this.$store.state.successMsg, variant: 'success' } : false
  }

  get getClassNameForStyling() {
    let className = "";
    const self = this;
    this.routeArray.forEach(item => {
      if(item.routeNames.includes(self.$route.name)) {
        className = item.className;
        return;
      }
    })
    return className;
  }

  get contentClass() {
    return this.showSidebar ? 'col-lg-9' : 'col-lg-12'
  }

}</script>

<style lang="scss" scoped>
  #layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  .content {
    display: flex;
    position: relative;
    flex: 1;
    justify-content: center;
    .row {
      width: 100%;;
    }   
  }
  .sidebar-container {
    display: flex;
    align-items: stretch;
  }

</style>

<style lang="scss">

  .rmv-spacing {
    margin: 0px;
    padding: 0px;
  }

  .highlight {
    color: #f0ad4e;
  }

  .container-fluid {
    max-width: 1200px;
    padding: 0 24px !important;
  }  

  @media (max-width: 576px) {
  }

  @media (max-width: 768px) {
    .validator-action-container {
      div {
        text-align: center;
      }      
      button {
        width: 100%;
        margin: 0 0 12px 0 !important;
      }
    }    
  }

  @media (max-width: 992px) {
    .navbar-side {
      display: flex;
      flex-direction: row !important;     
      border-right: none !important;
      border-bottom: 2px solid #f2f1f3;
      justify-content: space-evenly;
      li {
        max-width: 200px;
        display: inline-block;
        a {
          padding: 0px 0px 6px 0px !important;
        }
      }
    }
    .router-active {
      border-left: 0px !important;
      border-bottom: 5px solid #5756e6;
    }
  }
  
  @media (max-width: 1200px) {
    
  }
</style>


