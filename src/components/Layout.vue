<template>
  <div id="layout" class="d-flex flex-column" :class="getClassNameForStyling">        
    <faucet-header v-on:update:chain="refresh()"></faucet-header>
    <div class="content container-fluid">      
      <warning-overlay type="metamask"></warning-overlay>
      <warning-overlay type="mapping"></warning-overlay>
      <div class="row">
        <div class="col rmv-spacing">
          <b-modal id="sign-wallet-modal"  title="Sign Your wallet" hide-footer centered no-close-on-backdrop> 
              {{ $t('components.layout.sign_wallet', {walletType:walletType}) }}
          </b-modal>
          <b-modal id="already-mapped" title="Account Mapped" hide-footer centered no-close-on-backdrop> 
              {{ $t('components.layout.already_mapped') }}
          </b-modal> 
          <loading-spinner v-if="showLoadingSpinner" :showBackdrop="true"></loading-spinner>
          <transition name="page" mode="out-in">
          <router-view></router-view>
          </transition>
        </div>        
      </div>          
    </div>    
     <b-modal id="metamaskChangeDialog" no-close-on-backdrop hider-header hide-footer centered v-model="metamaskChangeAlert">
        <div class="d-block text-center">
          <p>{{ $t('components.layout.metamask_changed')}}</p>
        </div>
        <b-button class="mt-2" variant="primary" block @click="restart">OK</b-button>
     </b-modal>
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
      'setErrorMsg'
    ]),
    ...DappChainStore.mapActions([
    ]),
    ...DPOSStore.mapActions([
      'initializeDependencies',
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
      'metamaskError',
      'mappingError'
    ]),
    ...DPOSStore.mapState([
      'showSidebar',
      "currentMetamaskAddress",
      'showLoadingSpinner',
      'showAlreadyMappedModal',
      'showSignWalletModal',
      'mappingSuccess',
      'walletType',
      'status'
    ])    
  },
})

export default class Layout extends Vue { 

  metamaskChangeAlert = false

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
    this.$router.afterEach((to, from) => this.$root.$emit("refreshBalances"))
  }

  beforeMount() {
    if(!this.userIsLoggedIn) this.$router.push({ path: '/login' })
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

    // Clear any remaining local storage
    localStorage.clear()
      
    if(this.$route.meta.requireDeps) {
      this.attemptToInitialize()     
    } else {
      this.$root.$on('login', async () => {
        this.attemptToInitialize()
      })
    }      
    
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        
        // TODO: this is to resolve a bug with mismatched receipts, once all users are fixed, please remove. 
        if (window.resolvingMismatchedReceipt) {
          return;
        }

        if (this.currentMetamaskAddress && 
          this.currentMetamaskAddress !== accounts[0] ) {
                localStorage.clear()
                this.metamaskChangeAlert = true
                window.ethereum.removeAllListeners()
        }

      })
    }

  }

  async restart() {
      window.location.reload(true)
  }


  async attemptToInitialize() {
    try {
      await this.initializeDependencies()
      this.$root.$emit("initialized")
      this.$root.$emit("refreshBalances")
    } catch(err) {
      this.$root.$emit("logout")
      this.setMappingError(null)
      this.setMappingStatus(null)
    }           
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
}
</script>

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

.page-enter-active, .page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter, .page-leave-to {
  opacity: 0;
  transform: translateX(-30%);
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


