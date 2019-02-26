<template>
  <div id="layout" class="d-flex flex-column" :class="getClassNameForStyling">        
    <!-- <faucet-header v-on:update:chain="refresh()" @onLogin="onLoginAccount"></faucet-header> -->
    <faucet-header v-on:update:chain="refresh()"></faucet-header>    
    <div class="content container-fluid">      
      <div v-if="metamaskDisabled && userIsLoggedIn" class="disabled-overlay">
        <div>           
          <div class="network-error-container mb-3">
            <img src="../assets/metamask-error-graphic.png"/>
          </div>
          <h4>
            {{ $t('components.layout.metamask_error') }}
          </h4>
          <div>
            <span>
              {{ $t('components.layout.please_enable_metamask_or_switch') }}
            </span>
          </div>              
        </div>
      </div>
      <div v-if="mappingStatus == 'INCOMPATIBLE_MAPPING' && userIsLoggedIn" class="disabled-overlay">
        <div>           
          <div class="network-error-container mb-3">
            <img src="../assets/network-error-graphic.png"/>
          </div>
          <h4>
            {{ $t('components.layout.mapping_error') }}
          </h4>
          <div v-if="mappingError">

            {{ $t('components.layout.your_account_appears_to_be') }} <br>
            <span class="address">{{mappingError.mappedEthAddress}}</span> <br>
            {{ $t('components.layout.but_your_current_account_address') }} <br>
            <span class="address">{{mappingError.metamaskAddress}}</span> <br>
            {{ $t('components.layout.please_change_your_metamask_account') }}

          </div>
          <div v-else>
            <span>
              {{ $t('components.layout.please_check_your_metamask_account') }}
            </span>
          </div>              
        </div>
      </div>         
      <div class="row">
        <div v-show="showSidebar" class="col-lg-3">
          <faucet-sidebar></faucet-sidebar>      
        </div>
        <div :class="contentClass">
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

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

import { isIP } from 'net';

@Component({
  components: {
    FaucetHeader,
    FaucetSidebar,
    FaucetFooter,
    LoadingSpinner
  },
  props: {
    data: Object,
  },
  methods: {
    ...mapActions([
      // 'registerWeb3',
      // 'updateContractState',
      // 'checkNetwork',
      'checkLottery',
      'checkCryptoBacker'      
    ]),
    ...mapMutations([
      'setUserIsLoggedIn',
      'setErrorMsg'
    ]),
    ...DappChainStore.mapActions([
      'init',
      'initDposUser',
      'setMetamaskStatus',
      'setMetamaskError',
      'ensureIdentityMappingExists'
    ]),
    ...DPOSStore.mapActions([
      'initializeDependencies'
    ]),
    ...DPOSStore.mapMutations([
      'setConnectedToMetamask',
      'setWeb3',
      'setCurrentMetamaskAddress'      
    ])
  },  
  computed: {
    ...mapState([
      'alternateBackground',
      'hasPendingApprove',
      'pendingApprove',
      'showAnnouncement',
      'showLottery',
      'showCryptoBacker',
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
      'showLoadingSpinner'
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

  // Hide crypto backer modal
  // @Watch('showCryptoBacker')
  // onShowCryptoBackerChanged(newValue, oldValue) {
  //   if(newValue) {
  //     this.$root.$emit('bv::show::modal', 'crypto-backer')
  //   }
  // }

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

  async mounted() {
    this.attemptToInitialize()     
    
    this.$root.$on('login', async () => {
      this.attemptToInitialize()
    })      
    
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if(this.userIsLoggedIn) this.ensureIdentityMappingExists({currentAddress: accounts[0]})
        this.setCurrentMetamaskAddress(accounts[0])
      })
    }

  }

  async attemptToInitialize() {
    try {
      await this.initializeDependencies()
      this.$root.$emit("initialized")
    } catch(err) {
      this.$root.$emit("logout")
    }           
  }

  onLoginHandler() {
    console.log('Logged in')
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

  .disabled-overlay {
    position: fixed;
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


