<template>
  <div id="layout" class="d-flex flex-column" :class="getClassNameForStyling">        
    <!-- <faucet-header v-on:update:chain="refresh()" @onLogin="onLoginAccount"></faucet-header> -->
    <div class="content">      
      <div v-if="metamaskDisabled && userIsLoggedIn" class="disabled-overlay">
        <div>           
          <div class="network-error-container mb-3">
            <img src="../assets/metamask-error-graphic.png"/>
          </div>
          <h4>
            Metamask error!?
          </h4>
          <div>
            <span>
              Please enable Metamask or switch to a supported browser
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
            Mapping error!?
          </h4>
          <div v-if="mappingError">

            Your account appears to be mapped with the following address: <br>
            <span class="address">{{mappingError.mappedEthAddress}}</span> <br>
            but your current account address is: <br>
            <span class="address">{{mappingError.metamaskAddress}}</span> <br>
            Please change your Metamask account

          </div>
          <div v-else>
            <span>
              Please check your Metamask account and/or network
            </span>
          </div>              
        </div>
      </div>         
      <div class="row column-wrapper">
        <div v-show="showSidebar" class="rmv-spacing col sidebar-container">
          <faucet-sidebar></faucet-sidebar>      
        </div>
        <div id="content-container" :class="contentClass">
          <transition name="router-anim" enter-active-class="animated fadeIn fast" leave-active-class="animated fadeOut fast">
            <loading-spinner v-if="showLoadingSpinner" :showBackdrop="true"></loading-spinner>
          </transition>
          <transition name="router-anim" enter-active-class="animated fadeInUp faster" leave-active-class="animated fadeOutDown faster">
            <router-view></router-view>
          </transition>
        </div>        
      </div>
    </div>    
    <faucet-header v-on:update:chain="refresh()"></faucet-header>        
    <!-- <faucet-footer></faucet-footer> -->
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
      'initializeDependencies'
    ]),
    ...DPOSStore.mapMutations([
      'setConnectedToMetamask',
      'setCurrentMetamaskAddress'      
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
    return this.showSidebar ? 'col-lg-10' : 'col-lg-12'
  }

}</script>

<style lang="scss" scoped>
  #layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  #content-container {
    padding: 36px 14px;
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
  .column-wrapper {
    background-color: #eff3f5;
  }

</style>

<style lang="scss">

  body {
    min-width: 580px;
    font-family: 'Roboto Condensed', sans-serif;
  }

  h1 {
    color: #222529 !important;
    font-weight: 400;
    font-size: 30px;    
  }

  span {
    color: #5455e1 !important;
  }

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

  // Table styling

  // rgba(84, 85, 225, 0.18)
  #faucet-table.table tbody tr td {
    border: none !important;
    background-color: inherit !important;
    border-radius: 0 !important;
  }

  #faucet-table.table tbody tr:nth-child(odd) {
    background: rgba(84, 85, 225, 0.03) !important;
  }


  @media (max-width: 576px) {
    .hidden-tiny {
      display: none; 
    }    
  }

  @media (max-width: 768px) {
    .hidden-small {
      display: none;
    }    
    .validator-action-container {
      div {
        text-align: center;
      }      
      button {
        width: 100%;
        margin: 0 0 12px 0 !important;
      }
    }
    .sidebar-container {
      max-width: 100% !important;
    }  
  }

  @media (max-width: 992px) {
    .hidden-medium {
      display: none;
    }        
    .navbar-side {
      display: flex;
      flex-direction: row !important;     
      border-right: none !important;
      border-bottom: 2px solid #f2f1f3;
      justify-content: space-evenly;
      padding-top: 0 !important;
      height: auto !important;
      width: 100%; 
      li {
        max-width: 200px;
        display: inline-block;
        a {
          padding: 0px 0px 6px 0px !important;
        }
      }
    }
    .navbar-brand {
      padding-left: 0 !important;
    }
    .router span {
      text-align: center;
    }
    .router-active {
      border-left: 0px !important;
      border-bottom: 5px solid #5756e6;
    }
    
  }

 @media (min-width: 992px) {
  .sidebar-container {
    max-width: 340px;
  }
 }

  @media (max-width: 1200px) {
    
  }
</style>


