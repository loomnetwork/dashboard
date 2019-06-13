<!-- PlasmaChain Delegators -->
<template>
  <div class>
    <div class="pt-3">
      <main>
        <hardware-wallet-modal ref="hardwareWalletConfigRef"/>
        <div class="container-fluid mb-5 rmv-padding">
          <b-card title="Select wallet">
            <div class="row wallet-provider-container">
              <div class="col-sm-12 col-md-6">
                <b-card
                  id="ledger-button"
                  class="wallet-selection-card text-center mb-3"
                  @click="setWallet('ledger')"
                >
                  <h5>Ledger</h5>
                  <img src="../assets/ledger_logo.svg">
                  <small>
                    Connect & sign via your
                    <br>hardware wallet
                  </small>
                </b-card>
              </div>
              <div class="col-sm-12 col-md-6">
                <b-card
                  id="metamask-button"
                  class="wallet-selection-card text-center"
                  :class="{'wallet-selection-card disabled' : !isMetamaskInstalled()}"
                  @click="setWallet('metamask')"
                >
                  <h5>Metamask</h5>
                  <img src="../assets/metamask_logo.png">
                  <small>
                    Connect & sign via your browser
                    <br>or extension
                  </small>
                </b-card>
              </div>
              <div class="col-sm-12 col-md-6">
                <b-card
                  id="trezor-button"
                  class="wallet-selection-card text-center"
                  :class="{'wallet-selection-card disabled' : !isMetamaskInstalled()}"
                  @click="setWallet('metamask')"
                >
                  <h5>
                    Trezor
                    <small>via Metamask</small>
                  </h5>
                  <img src="../assets/trezor_logo.png">
                  <small>
                    Connect to your Trezor wallet
                    <br>via Metamask
                  </small>
                </b-card>
              </div>
              <div class="col-sm-12 col-md-6">
                <b-card
                  id="explore-button"
                  class="wallet-selection-card text-center"
                  @click="addressModalShow = !addressModalShow"
                >
                  <h5>Explore</h5>
                  <img id="wallet-card-img-large" src="../assets/network-error-graphic.png">
                  <small>Explore an account</small>
                </b-card>
              </div>
            </div>
          </b-card>

          <b-card v-if="!isMetamaskInstalled()" class="metamask-suggest">
            <img id="metamask-mini-icon" src="../assets/metamask_logo.png">
            <b-card-text class="text-inline">
              Looks like you don't have
              <font id="orange">Metamask</font> with you
            </b-card-text>
            <b-button
              target="_blank" 
              variant="outline-primary"
              href="https://metamask.io/"
              style="float: right; margin-top: 5px"
            >Get one here!</b-button>
          </b-card>

          <b-modal v-model="addressModalShow" hide-header hide-footer>
            <div>
              <b-form-input v-model="address" class="mb-2" placeholder="Enter your address"></b-form-input>
              <b-button type="submit" @click="setExploreMode(address)" variant="primary">Submit</b-button>
            </div>
          </b-modal>

          <ChainSelector style="width: 250px; margin: 24px auto;" class="connection-status"/>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator"
import ChainSelector from "../components/ChainSelector.vue"
import HardwareWalletModal from "../components/modals/HardwareWalletModal.vue"
import { setInterval } from "timers"
import { BModal } from "bootstrap-vue"

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
  get $state() { return (this.$store.state as DashboardState) }

  setWallet = ethereumModule.setWalletType
  setExploreMode = ethereumModule.setToExploreMode
  // vuex
  // setUserIsLoggedIn = CommonTypedStore.setUserIsLoggedIn
  // initializeDependencies = DPOSTypedStore.initializeDependencies
  // setWalletType = DPOSTypedStore.setWalletType
  // setShowLoadingSpinner = CommonTypedStore.setShowLoadingSpinner
  // signOut = CommonTypedStore.signOut

  addChainUrl = DPOSTypedStore.addChainUrl
  setMappingError = DPOSTypedStore.setMappingError
  setMappingStatus = DPOSTypedStore.setMappingStatus

  address = ""
  addressModalShow = false
  metamaskIsInstalled = false

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
    return this.$refs[ref] as BModal
  }

  // async openLoginModal() {
  //   this.$root.$emit("bv::show::modal", "login-account-modal")
  // }

  onConnectionUrlChanged(newUrl) {
    this.$emit("update:chain")
  }

  isMetamaskInstalled() {
    /* For Chrome & Firefox Browser
       if user dont have Metamask installed, there is no web3 that inject in their browser
       (except user install other extensions for crypto wallet (Ethereum platform))

       For Opera Browser
       Metamask on opera is broken now, so we have to wait for Metamask dev team to fix
    */
    // @ts-ignore
    if (typeof window.web3 == "undefined" || window.ethereum == "undefined") { // No injected web3 in browser
      return false
    } else { // Already have a injected web3 in browser
      // @ts-ignore
      if (window.web3.currentProvider.isMetaMask || window.ethereum.isMetaMask) {
        return true
      } else {
        return false // No Metamask installed
      }
    }
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
      margin: 16px;
    }
  }
}

@media (max-width: 767px) {
  #login-tab {
    .actions {
      display: flex;
      flex-direction: column;
      button {
        width: 100%;
        margin: 8px 0;
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
  h3,
  h1 {
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
  .wallet-selection-card.disabled {
    pointer-events: none;
    opacity: 0.3;
  }
}

.metamask-suggest {
  position: relative;
  margin-top: 12px;
  .text-inline {
    margin-left: 10px;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.2;
    display: inline;
  }
}

#wallet-card-img-large {
  height: auto;
  width: 96px;
}
#metamask-mini-icon {
  width: 48px;
  height: auto;
  display: inline;
}
#orange {
  color: #f29040;
}
</style>
<style>
body {
  overflow-y: scroll;
}
</style>
