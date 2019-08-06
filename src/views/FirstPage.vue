<!-- PlasmaChain Delegators -->
<template>
  <div class>
    <div class="pt-3">
      <main>
        <hardware-wallet-modal ref="hardwareWalletConfigRef" />
        <div class="container-fluid mb-5 rmv-padding">
          <b-modal
            no-close-on-esc
            no-close-on-backdrop
            id="modal-lg"
            size="lg"
            @hide="onClose"
            v-model="maybeRelentlessUser"
          >
            <div class="confirm-link text-center">
              <h3>{{ $t('views.first_page.ask_from_relentless_marketplace') }}</h3>
              <p>{{ $t('views.first_page.if_from_relentless_marketplace') }}</p>
              <div class="linking-div">
                <img src="../assets/images/relentless.png" />
                <i style="font-size:56px;" class="fa">&#8651;</i>
                <loom-icon width="56px" height="56px" :color="'#6eccd8'" />
              </div>
              <div class="linking-div-choice">
                <b-button block variant="outline-primary" :href="loomGamesUrl">{{ $t('views.first_page.link_my_account') }}</b-button>
              </div>
            </div>
            <div slot="modal-footer" class="w-100" style="text-align: center;">
              <b-button
                v-show="!reconsider"
                variant="link"
                style="color: gray;"
                @click="reconsider = true"
              >{{ $t('views.first_page.not_from_relentless_marketplace') }}</b-button>
              <div class="reconsider" v-show="reconsider">
                <h5>{{ $t('views.first_page.you_sure') }}</h5>
                <p
                  style="color: red;"
                >{{ $t('views.first_page.warn_note') }}</p>
                <b-button
                  variant="outline-dark"
                  @click="maybeRelentlessUser = false"
                >{{ $t('views.first_page.create_new_account') }}</b-button>
              </div>
            </div>
          </b-modal>
          <b-card :title="$t('views.first_page.select_wallet')" class="wallet-provider-container">
            <div class="row">
              <div class="col-sm-12 mb-3">
                <b-card
                  id="metamask-button"
                  class="wallet-selection-card text-center"
                  :class="{'wallet-selection-card disabled' : !metamaskInstalled}"
                  @click="setWallet('metamask')"
                >
                  <div>
                    <img src="../assets/metamask_logo.png" />
                    <span>{{ $t('views.first_page.wallets.metamask') }}</span>
                  </div>
                </b-card>
              </div>
              <div class="col-sm-12">
                <b-card
                  id="ledger-button"
                  class="wallet-selection-card text-center mb-3"
                  @click="$root.$emit('bv::show::modal', 'metmask-hardware-wizard')"
                >
                  <div>
                    <img src="../assets/ledger_logo.svg" />
                    <span>{{ $t('views.first_page.wallets.ledger_via_metamask') }}</span>
                  </div>
                </b-card>
              </div>
              <div class="col-sm-12 mb-3">
                <b-card
                  id="trezor-button"
                  class="wallet-selection-card text-center"
                  :class="{'disabled' : !metamaskInstalled}"
                  @click="$root.$emit('bv::show::modal', 'metmask-hardware-wizard')"
                >
                  <div>
                    <img src="../assets/metamask_logo.png" />
                    <span>{{ $t('views.first_page.wallets.trezor_via_metamask') }}</span>
                  </div>
                </b-card>
              </div>
              <div class="col-sm-12">
                <b-card
                  id="ledger-button"
                  class="wallet-selection-card text-center mb-3"
                  @click="setWallet('ledger')"
                >
                  <div id="ledger-card">
                    <img src="../assets/ledger_logo.svg" />
                    <span>{{ $t('views.first_page.wallets.ledger_legacy') }}</span>
                  </div>

                </b-card>
              </div>   
              <div class="col-sm-12 mb-3" v-if="!$store.state.disabled.includes('portis')">
                <b-card
                  id="portis-button"
                  class="wallet-selection-card text-center"
                  @click="setWallet('portis')"
                >
                  <div class="ml-1">
                    <img src="../assets/portis_icon.svg" />
                    <span>Portis</span>
                  </div>
                </b-card>
              </div>
              <div class="col-sm-12 mb-3" v-if="!$store.state.disabled.includes('fortmatic')">
                <b-card
                  id="fortmatic-button"
                  class="wallet-selection-card text-center"
                  @click="setWallet('fortmatic')"
                >
                  <div>
                    <img src="../assets/fortmatic-icon.svg" />
                    <span>Fortmatic</span>
                  </div>
                </b-card>
              </div>           
              <div class="col-sm-12">
                <b-card
                  id="explore-button"
                  class="wallet-selection-card text-center"
                  @click="addressModalShow = !addressModalShow"
                >
                  <div>
                    <fa icon="search" class="search-icon" />
                    <span>{{ $t('views.first_page.wallets.explore') }}</span>
                  </div>
                </b-card>
              </div>

            </div>
          </b-card>

          <b-card v-if="!metamaskInstalled" class="metamask-suggest">
            <b-row>
              <b-col class="card-label">
                <img class="mr-2" id="metamask-mini-icon" src="../assets/metamask_logo.png" />
                <i18n path="views.first_page.no_metamask">
                  <span place="metamask" id="orange">{{ $t('views.first_page.wallets.metamask') }}</span>
                </i18n>
              </b-col>
              <b-col>
                <b-button
                  target="_blank"
                  variant="outline-primary"
                  href="https://metamask.io/"
                  style="float: right; margin-top: 5px"
                >{{ $t('views.first_page.get_one') }}</b-button>
              </b-col>
            </b-row>
          </b-card>

          <b-modal v-model="addressModalShow" hide-header hide-footer>
            <div>
              <b-form-input v-model="address" class="mb-2" :placeholder="$t('input_placeholder.enter_your_addr')"></b-form-input>
              <b-button type="submit" @click="setExploreMode(address)" variant="primary">{{ $t('button.submit') }}</b-button>
            </div>
          </b-modal>

          <b-modal id="metmask-hardware-wizard" :title="$t('components.modals.hardware_wallet_modal.hardware_wallet')">
            <div>
              <div class="wizard-img-container mb-3">
                <img class="wizard-img" src="../assets/metamask-hardware-screencap.png" alt />
              </div>
              <p>{{$t("messages.metamask_hardware_wizard")}}</p>
            </div>
            <template slot="modal-footer">
              <div>
                <b-btn @click="setWallet('metamask')">{{ $t('button.next') }}</b-btn>
              </div>
            </template>
          </b-modal>
          <b-popover
            class="popover"
            target="ledger-card"
            :title="$t('views.first_page.now_deprecated')"
            triggers="hover"
          >
            <i18n path="views.first_page.recommend_use_ledger_via_metamask">
              <strong place="ledgerMetamask">{{ $t('views.first_page.wallets.ledger_via_metamask') }}</strong>
            </i18n>
          </b-popover>
          <ChainSelector style="width: 250px; margin: 0 auto;" class="connection-status" />
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
import { feedbackModule } from "../feedback/store"

import { PortisAdapter } from "../store/ethereum/wallets/portis"
import { MetaMaskAdapter } from "../store/ethereum/wallets/metamask"

@Component({
  components: {
    ChainSelector,
    HardwareWalletModal,
    LoomIcon,
  },
})
export default class FirstPage extends Vue {

  get $state() { return (this.$store.state as DashboardState) }

  get maybeRelentlessUser() {
    return this.$state.gateway.maybeRelentlessUser
  }
  set maybeRelentlessUser(val) {
    if (val === false) {
      gatewayModule.setMaybeRelentlessUser(val)
    }
  }

  get loomGamesUrl() {
    return this.$state.plasma.loomGamesEndpoint
  }

  setWallet = ethereumModule.setWalletType
  setExploreMode = ethereumModule.setToExploreMode

  address = ""
  addressModalShow = false
  mappedModalShow = false
  reconsider = false

  onConnectionUrlChanged(newUrl) {
    this.$emit("update:chain")
  }

  onClose() {
    if (!this.$state.ethereum.signer) feedbackModule.endTask()
  }

  /* For Chrome & Firefox Browser
     if user dont have Metamask installed, there is no web3 that inject in their browser
     (except user install other extensions for crypto wallet (Ethereum platform))

     For Opera Browser
     Metamask on opera is broken now, so we have to wait for Metamask dev team to fix
  */
  get metamaskInstalled() {
    return MetaMaskAdapter.detect()
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

.wizard-img-container {
  background-color: #6f6f6f;
  overflow: hidden;
  .wizard-img {
    display: block;
    margin: 0 auto;
    max-width: 220px;
    box-shadow: rgba(23, 21, 21, 0.56) 0px 3px 8px 0px;
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

.popover {
  h3 {
    color: gray;
  }
}

.nav-pills .nav-link.active span {
  display: inline-block;
  color: #ffffff;
  margin-right: 6px;
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
  max-width: 350px;
  margin: 24px auto;
  .wallet-selection-card {
    position: relative;
    div {
      display: flex;
      align-items: center;
      width: 100%;
    }
    img {
      height: 20px !important;
      width: auto;
      margin-right: 3px;
      height: auto;
    }
    small {
      display: block;
    }
    span {
      flex: 1;
      text-align: center;
      margin-left: -24px;
      font-size: 14px;
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
    .card-body {
      padding: 0.5rem 0.8rem;
    }
    .search-icon {
      margin-right: 6px;
      height: 16px;
      width: 16px;
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
