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
                <b-card id="ledger-button" class="wallet-selection-card text-center mb-3" @click="setWallet('ledger')">
                  <h5>Ledger</h5>
                  <img src="../assets/ledger_logo.svg">
                  <small>
                    Connect & sign via your <br>
                    hardware wallet                      
                  </small>
                </b-card>
              </div>
              <div class="col-sm-12 col-md-6">
                <b-card id="metamask-button" class="wallet-selection-card text-center" @click="setWallet('metamask')">
                  <h5>Metamask</h5>
                  <img src="../assets/metamask_logo.png">
                  <small>
                    Connect & sign via your browser <br>
                    or extension                      
                  </small>
                </b-card>                  
              </div>                 
               <div class="col-sm-12 col-md-6">
                <b-card id="trezor-button" class="wallet-selection-card text-center" @click="setWallet('metamask')">
                  <h5>Trezor <small>via Metamask</small></h5>
                  <img src="../assets/trezor_logo.png">
                  <small>
                    Connect to your Trezor wallet <br>
                    via Metamask                    
                  </small>
                </b-card>                  
              </div>   
              <div class="col-sm-12 col-md-6">
                <b-card id="explore-button" class="wallet-selection-card text-center" @click="addressModalShow = !addressModalShow">
                  <h5>Explore</h5>
                  <img id="wallet-card-img-large" src="../assets/network-error-graphic.png">
                  <small>
                    Explore an account              
                  </small>
                </b-card>                  
              </div>                
            </div>  
          </b-card>
          
          <b-modal v-model="addressModalShow" hide-header hide-footer>
            <div>
              <b-form-input v-model="address" class="mb-2" placeholder="Enter your address"></b-form-input>
              <b-button type="submit" @click="setExploreMode(address)" variant="primary">Submit</b-button>
            </div>   
          </b-modal>

          <ChainSelector style="width: 250px; margin: 24px auto;"
                         class="connection-status"
                         v-if="!isProduction"
                         :allowedUrls="chainUrls"
                         :serverUrl="networkId"/>


        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator"
import ChainSelector from "../components/ChainSelector"
import HardwareWalletModal from "../components/modals/HardwareWalletModal.vue"
import { setInterval } from "timers"
import { Modal } from "bootstrap-vue"

import { ethereumModule } from "@/store/ethereum"

import { DPOSTypedStore } from "@/store/dpos-old"
import { CommonTypedStore } from "../store/common"
import { DashboardState } from "../types"

@Component({
  components: {
    ChainSelector,
    HardwareWalletModal,
  },
})
export default class FirstPage extends Vue {

  get userIsLoggedIn() { return CommonTypedStore.getUserIsLoggedIn }
  get chainUrls() { return this.$state.DPOS.chainUrls }
  get networkId() { return this.$state.DPOS.networkId }
  get walletType() { return this.$state.DPOS.walletType }
  get mappingSuccess() { return this.$state.DPOS.mappingSuccess }
  get $state() { return (this.$store.state as DashboardState)}

  setWallet = ethereumModule.setWalletType
  setExploreMode = ethereumModule.setToExploreMode
  // vuex
  // setUserIsLoggedIn = CommonTypedStore.setUserIsLoggedIn
  // initializeDependencies = DPOSTypedStore.initializeDependencies
  // setWalletType = DPOSTypedStore.setWalletType
  // setShowLoadingSpinner = DPOSTypedStore.setShowLoadingSpinner
  // signOut = CommonTypedStore.signOut

  addChainUrl = DPOSTypedStore.addChainUrl
  setMappingError = DPOSTypedStore.setMappingError
  setMappingStatus = DPOSTypedStore.setMappingStatus

  address = ""
  addressModalShow = false

  // async selectWallet(wallet) {
  //   if (wallet === "ledger") {
  //     this.setWalletType("ledger")
  //     this.setUserIsLoggedIn(true)

  //     this.modal("hardwareWalletConfigRef").show()
  //   } else if (wallet === "metamask") {
  //     this.setWalletType("metamask")
  //     this.setUserIsLoggedIn(true)
  //     await this.initializeDependencies()
  //   } else {
  //     return
  //   }
  // }

  modal(ref: string) {
   return this.$refs[ref] as Modal
  }

  // async openLoginModal() {
  //   this.$root.$emit("bv::show::modal", "login-account-modal")
  // }

  onConnectionUrlChanged(newUrl) {
    this.$emit("update:chain")
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
    min-height: 220px;
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

#wallet-card-img-large {
  height: auto;
  width: 96px;
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
