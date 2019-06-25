<!-- PlasmaChain Delegators -->
<template>
  <div class>
    <div class="pt-3">
      <main>
        <hardware-wallet-modal ref="hardwareWalletConfigRef"/>
        <div class="container-fluid mb-5 rmv-padding">
          <b-modal no-close-on-esc no-close-on-backdrop id="modal-lg" size="lg" @hide="onClose" v-model="notMapped">
            <div class="confirm-link text-center">
              <h3>Are you from Relentless Marketplace ?</h3>
              <p>If you are, looks like you have to link your marketplace account to this dashboard account</p>
              <div class="linking-div">
                <img src="../assets/images/relentless.png">
                <i style="font-size:56px;" class="fa">&#8651;</i>
                <loom-icon width="56px" height="56px" :color="'#6eccd8'"/>
              </div>
              <div class="linking-div-choice">
                <b-button block variant="outline-primary" :href="loomGamesUrl">Link my account</b-button>
              </div>
            </div>
            <div slot="modal-footer" class="w-100" style="text-align: center;">
              <b-button
                v-show="!reconsider"
                variant="link"
                style="color: gray;"
                @click="reconsider = true"
              >Nope, I'm not from Relentless Marketplace</b-button>
              <div class="reconsider" v-show="reconsider">
                <h5>Are you sure ?</h5>
                <p
                  style="color: red;"
                >We will create a new fresh account for you, But account linking is unable anymore</p>
                <b-button
                  variant="outline-dark"
                  @click="setNewMappingAgree(true)"
                >Create a new account</b-button>
              </div>
            </div>
          </b-modal>
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
                  :class="{'wallet-selection-card disabled' : !metamaskInstalled}"
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
                  :class="{'disabled' : !metamaskInstalled}"
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
                  <fa icon="search" style=" height: 70px;width: 70px;"/>
                  <small>Explore an account</small>
                </b-card>
              </div>
            </div>
          </b-card>

          <b-card v-if="!metamaskInstalled" class="metamask-suggest">
            <img id="metamask-mini-icon" src="../assets/metamask_logo.png">
            <b-card-text class="text-inline">
              Looks like you don't have
              <font id="orange">Metamask</font> extension
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
import { BModal } from "bootstrap-vue"

import { ethereumModule } from "@/store/ethereum"
import { DashboardState } from "../types"

import LoomIcon from "@/components/LoomIcon.vue"
import { Gateway } from "../store/gateway/contracts/Gateway"
import { gatewayModule } from "../store/gateway"
import { feedbackModule } from '../feedback/store';

import Axios from "axios"

@Component({
  components: {
    ChainSelector,
    HardwareWalletModal,
    LoomIcon,
  },
})
export default class FirstPage extends Vue {

  get $state() { return (this.$store.state as DashboardState) }

  get notMapped() {
      return (this.$state.gateway.mapping !== null) &&
             (this.$state.gateway.mapping.to!.isEmpty()) &&
             (this.$state.ethereum.signer)
  }
  get newMappingAgree() { return this.$state.gateway.newMappingAgree }

  get fromMarketplace() { return this.$state.gateway.fromMarketplace }

  loomGamesUrl = this.$state.plasma.loomGamesEndpoint

  setWallet = ethereumModule.setWalletType
  setExploreMode = ethereumModule.setToExploreMode

  setNewMappingAgree = gatewayModule.setNewMappingAgree

  address = ""
  addressModalShow = false
  mappedModalShow = false
  reconsider = false

  onConnectionUrlChanged(newUrl) {
    this.$emit("update:chain")
  }

  onClose() {
    feedbackModule.endTask()
  }

  set notMapped(val) {
  }
  set newMappingAgree(val) {
  }
  set fromMarketplace(val) {
  }
  
  /* For Chrome & Firefox Browser
     if user dont have Metamask installed, there is no web3 that inject in their browser
     (except user install other extensions for crypto wallet (Ethereum platform))

     For Opera Browser
     Metamask on opera is broken now, so we have to wait for Metamask dev team to fix
  */
  get metamaskInstalled() {
    return ("ethereum" in window) ||
      // @ts-ignore
      ("web3" in window && window.web3.currentProvider.isMetaMask)
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

.confirm-link {
  display: flex;
  flex-direction: column;
  h3 {
    color: black;
  }
}

.reconsider {
  margin-bottom: 10px;
}

.linking-div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 35%;
  align-self: center;
  margin: 0em 0.5em;
}

.linking-div-choice {
  margin-top: 20px;
  margin-left: 50px;
  margin-right: 50px;
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
