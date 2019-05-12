<!-- PlasmaChain Delegators -->
<template>
  <div class="">
    <div class="pt-3">
      <main>
        <hardware-wallet-modal ref="hardwareWalletConfigRef" @ok="onWalletConfig"/>
        <div class="container-fluid mb-5 rmv-padding">
     
          <b-card title="Select wallet">
            <div class="row wallet-provider-container">
              <div class="col-sm-12 col-md-6">
                <b-card class="wallet-selection-card text-center mb-3" @click="selectWallet('ledger')">
                  <h5>Ledger</h5>
                  <img src="../assets/ledger_logo.svg">
                  <small>
                    Connect & sign via your <br>
                    hardware wallet                      
                  </small>
                </b-card>
              </div>
              <div class="col-sm-12 col-md-6">
                <b-card class="wallet-selection-card text-center" @click="selectWallet('metamask')">
                  <h5>Metamask</h5>
                  <img src="../assets/metamask_logo.png">
                  <small>
                    Connect & sign via your browser <br>
                    or extension                      
                  </small>
                </b-card>                  
              </div>                
            </div>  
          </b-card>


          <ChainSelector style="width: 250px; margin: 24px auto;" class="connection-status"
                      v-if="!isProduction"
                      :allowedUrls="chainUrls"
                      :serverUrl="networkId"
                      @urlClicked="onUserInputUrl"
                      @urlInput="onUserInputUrl"/>


        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import ChainSelector from '../components/ChainSelector'
import RestoreAccountModal from '../components/modals/RestoreAccountModal.vue'
import HardwareWalletModal from '../components/modals/HardwareWalletModal.vue'
import { setInterval } from 'timers';
import { Modal } from "bootstrap-vue";

import { DPOSTypedStore } from "@/store/dpos-old";
import { CommonTypedStore } from '../store/common';
import { DappChainTypedModule } from '../store/dappchain';
import { DashboardState } from '../types';

@Component({
  components: {
    ChainSelector,
    HardwareWalletModal,
  }
})
export default class FirstPage extends Vue {
  activeTab = 0
  currentStatus = this.STATUS.NONE
  showTabSpinner = false
  isProduction = window.location.hostname === "dashboard.dappchains.com"

  get userIsLoggedIn() { return CommonTypedStore.getUserIsLoggedIn }
  get chainUrls() { return this.$state.DappChain.chainUrls }
  get networkId() { return this.$state.DappChain.networkId }
  get walletType() { return this.$state.DPOS.walletType }
  get mappingSuccess() { return this.$state.DPOS.mappingSuccess }
  get $state() { return (this.$store.state as DashboardState)}

  // vuex
  setUserIsLoggedIn = CommonTypedStore.setUserIsLoggedIn
  initializeDependencies = DPOSTypedStore.initializeDependencies
  setWalletType = DPOSTypedStore.setWalletType
  setShowLoadingSpinner = DPOSTypedStore.setShowLoadingSpinner
  signOut = CommonTypedStore.signOut

  addChainUrl = DappChainTypedModule.addChainUrl
  setMappingError = DPOSTypedStore.setMappingError
  setMappingStatus = DPOSTypedStore.setMappingStatus

  async selectWallet(wallet) {
    if(wallet === "ledger") {
      this.setWalletType("ledger")
      this.setUserIsLoggedIn(true)

      this.modal("hardwareWalletConfigRef").show() 
    } else if(wallet === "metamask") {
      this.setWalletType("metamask")
      this.setUserIsLoggedIn(true)
      await this.initializeDependencies()      
    } else {
      return
    }
  }

  modal(ref:string) {
   return this.$refs[ref] as Modal
  }

  async openLoginModal() {
    this.$root.$emit('bv::show::modal', 'login-account-modal')
  }

  signOutHandler() {
    this.signOut()
    // @ts-ignore
    this.$router.push('/')
    this.setMappingError(null)
    this.setMappingStatus(null)
  }

  onConnectionUrlChanged(newUrl) {
    this.$emit('update:chain')
  }

  async onUserInputUrl(id){
    this.addChainUrl({id})
    // this.onConnectionUrlChanged(id)
    this.$forceUpdate()
    window.location.reload()
  }  


  async mounted() {
    if(!this.isMobile) return

    if ((window["web3"] && window["web3"].currentProvider.isTrust) || 
        !!window["imToken"] ||
        (window["web3"] && window["web3"].currentProvider.isMetaMask) ||
        (window["web3"] && window["web3"].isCobo)
      ) {
      this.setWalletType("metamask")
      this.setUserIsLoggedIn(true)
      await this.initializeDependencies()
    }

  }
  
  switchTab() {
    this.showTabSpinner = true

    setTimeout(() => {
      this.activeTab === 0 ? this.activeTab = 1 : this.activeTab = 0
      this.showTabSpinner = false
    }, 1000)
  }

  get STATUS() {
    return {
      NONE: 'NONE',
      CREATE_ACCOUNT: 'CREATE_ACCOUNT',
      RESTORE_ACCOUNT: 'RESTORE_ACCOUNT'
    }
  }

  get isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? true : false
  }

  async onWalletConfig() {
    this.setWalletType("ledger")
  }

}
</script>
<style lang="scss" scoped>
  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: 2px solid #f2f1f3;
  }
  .banner-container .col {
    padding: 0 36px;
  }

  .button-inner-container {
    width: 250px;
  }

  .rmv-padding {
    padding: 0 !important;
  }

  #login-tab {
    .actions {
      display: flex;
      justify-content: center;
      button {
        width: 250px;
        margin:16px;
      }
    }
  }

  @media (max-width: 767px) { 
    #login-tab {
      .actions {
      display: flex;
      flex-direction: column;
        button {
          width:100%;
          margin:8px 0;
        }
      }
    }

  }


</style>


<style lang="scss">



.header {
  .navbar {
    padding: 0;
    width: 100%;
    .navbar-brand {
      display: block;
      padding: 0;
      img {
        height: 56px;
      }
    }
  }
}

.nav-pills .nav-link.active span {
  display: inline-block;
  color: #ffffff;
  margin-right: 6px;
}

.wallet-selection-card:hover {
  border: 1px solid #53e63c;
}

.tab-title {
  display: inline-block;
  margin-right: 6px;
}

.loomy-graphic {
  display: block;
  max-height: 200px;
  margin: 0 auto;
}

.faucet {
  main {
    min-height: 620px;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  color: gray;
  h3,h1 {
    color: gray;
  }
  .bottom-border {
    border-bottom: 2px solid lightgray;
  }
  .top-border {
    border-top: 2px solid lightgray;
  }
  .no-top-border {
    border-top: 0;
  }
  .no-bottom-border {
    border-bottom: 0;
  }  
  .button {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    background-color: transparent;
    padding: 20px;
  }
}

.wallet-provider-container {
  .wallet-selection-card {
    position: relative;
    img {
      width: 72px;
      height: auto;
      margin-bottom: 12px;
    }
    small {
      display: block;
    }
    span.qa {        
      display: inline-block;
      line-height: 20px;        
      right: 12px;
      bottom: 12px;
      position: absolute;
      font-weight: bold;
      width: 20px;
      height: 20px;
      color: white;
      background-color: grey;
      border-radius: 50%;
    }
  }
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
