<template>
  <div id="layout" class="d-flex flex-column">
    <div v-if="networkId && networkId !== 'plasma'" style="background: #FFC107; padding: 0 16px;">
      <span>{{ $t('components.layout.network') }} {{networkId}}</span>
    </div>
    <div
      v-if="metamaskNetwork && (metamaskNetwork != s.ethereum.networkId)"
      style="background: #FF9800;padding: 16px 16px;"
    >
      <span>
        {{ $t('components.layout.your_wallet_connected_to', { network: ethereumNets[metamaskNetwork] }) }}
        {{ $t('components.layout.please_change_to', { network: s.ethereum.networkName }) }}
      </span>
    </div>
    <faucet-header></faucet-header>
    <div class="content">
      <div class="d-none d-lg-block">
        <faucet-sidebar></faucet-sidebar>
      </div>
      <div class="main-container">
        <div class="inner-container container">
          <b-modal
            id="sign-wallet-modal"
            :title="$t('components.layout.sign_wallet_title')"
            hide-footer
            centered
            no-close-on-backdrop
          >{{ $t('components.layout.sign_wallet') }}</b-modal>
          <b-modal
            id="already-mapped"
            title="$t('components.layout.account_mapped')"
            hide-footer
            centered
            no-close-on-backdrop
          >{{ $t('components.layout.already_mapped') }}</b-modal>
          <transition name="page" mode="out-in">
            <router-view></router-view>
            <!-- <p class="custom-notification">Scheduled maintance for upgrading to DPOSv3, please check back in a few hours.</p> -->
          </transition>
        </div>
      </div>
    </div>
    <b-modal
      id="metamaskChangeDialog"
      no-close-on-backdrop
      hide-header
      hide-footer
      centered
      v-model="metamaskChangeAlert"
    >
      <div class="d-block text-center">
        <p>{{ $t('components.layout.metamask_changed')}}</p>
      </div>
      <b-button class="mt-2" variant="primary" block @click="restart">OK</b-button>
    </b-modal>
    <transition
      name="router-anim"
      enter-active-class="animated fadeIn faster"
      leave-active-class="animated fadeOut faster"
    >
      <loading-spinner v-if="showLoadingSpinner" :showBackdrop="true"></loading-spinner>
    </transition>

    <!-- dpos -->
    <redelegate-modal></redelegate-modal>
    <undelegate-modal></undelegate-modal>

    <!-- gateway -->
    <progress-modal />
    <WithdrawConfirmed />
    <feedback-alert />
    <AccountMappingModal />

    <!-- announcement -->
    <AnnouncementModal />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator"

import FaucetHeader from "@/components/FaucetHeader.vue"
import FaucetSidebar from "@/components/FaucetSidebar.vue"
import FaucetFooter from "@/components/FaucetFooter.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import FeedbackNotification from "@/feedback/components/FeedbackNotification.vue"
import ProgressModal from "@/feedback/components/ProgressModal.vue"
import FeedbackAlert from "@/feedback/components/FeedbackAlert.vue"
import WithdrawConfirmed from "@/components/gateway/WithdrawConfirmed.vue"
import RedelegateModal from "@/dpos/components/RedelegateModal.vue"
import UndelegateModal from "@/dpos/components/UndelegateModal.vue"
import AccountMappingModal from "@/components/modals/AccountMappingModal.vue"
import AnnouncementModal from "@/components/modals/AnnouncementModal.vue"

import { DashboardState } from "@/types"
import { ethereumModule } from "../store/ethereum"

@Component({
  components: {
    FaucetHeader,
    FaucetSidebar,
    FaucetFooter,
    LoadingSpinner,
    FeedbackNotification,
    ProgressModal,
    FeedbackAlert,
    RedelegateModal,
    UndelegateModal,
    WithdrawConfirmed,
    AccountMappingModal,
    AnnouncementModal,
  },
  props: {
    data: Object,
  },
})
export default class Layout extends Vue {
  metamaskNetwork = ""

  ethereumNets = {
    1: "Mainnet",
    3: "Ropsten",
    4: "Rinkeby",
    5: "Goerli",
    42: "Kovan",
  }

  // get $state() { return (this.$store.state as DashboardState) }
  get s() { return (this.$store.state as DashboardState) }

  get showLoadingSpinner() { return false }

  get networkId() { return this.s.plasma.networkId }

  mounted() {
    this.getMetamaskNetwork()
    this.$root.$on("logout", () => {
      this.restart()
    })
  }

  get metamaskChangeAlert() {
    return ethereumModule.state.metamaskChangeAlert
  }

  restart() {
    window.location.reload(true)
  }

  @Watch("s.ethereum.networkId")
  getMetamaskNetwork() {
    if (!("ethereum" in window)) {
      this.metamaskNetwork = ""
    }
    try {
      // @ts-ignore
      let web3 =  new Web3(window.ethereum)
      web3.version.getNetwork((err, networkId) => {
        if (!err) this.metamaskNetwork = networkId

      })
    } catch (err) {
      console.error(err)
    }
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
    width: 100%;
  }
}
.sidebar-container {
  display: flex;
  align-items: stretch;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
  transition-delay: 0.5s;
}

.page-enter,
.page-leave-to {
  opacity: 0;
  transform: translateX(-30%);
}

.main-container {
  width: 100%;
  .inner-container {
    position: relative;
    height: 100%;
  }
}

.custom-notification {
  position: fixed;
  z-index: 10100;
  width: 90%;
  margin-top: 12px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
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


