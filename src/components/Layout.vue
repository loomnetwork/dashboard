<template>
  <div id="layout" class="d-flex flex-column">
    <div class="beta-ribbon">
      <span>BETA</span>
    </div>
    <div
      v-if="networkId !== 'plasma'"
      style="background: #FFC107;padding: 0 16px;"
    >Network: {{networkId}}</div>
    <faucet-header></faucet-header>
    <div class="content">
      <div class="d-none d-lg-block">
        <faucet-sidebar></faucet-sidebar>
      </div>
      <div class="main-container">
        <div class="inner-container container">
          <b-modal
            id="sign-wallet-modal"
            title="Sign Your wallet"
            hide-footer
            centered
            no-close-on-backdrop
          >{{ $t('components.layout.sign_wallet') }}</b-modal>
          <b-modal
            id="already-mapped"
            title="Account Mapped"
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
      hider-header
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
    <DepositApproved/>
    <DepositConfirmed/>
    <progress-modal/>
    <WithdrawProgress/>
    <WithdrawConfirmed/>
    <feedback-alert/>
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

import DepositApproved from "@/components/gateway/DepositApproved.vue"
import DepositConfirmed from "@/components/gateway/DepositConfirmed.vue"
import WithdrawProgress from "@/components/gateway/WithdrawProgress.vue"
import WithdrawConfirmed from "@/components/gateway/WithdrawConfirmed.vue"
import RedelegateModal from "@/dpos/components/RedelegateModal.vue"
import UndelegateModal from "@/dpos/components/UndelegateModal.vue"
import { DashboardState } from "@/types"

@Component({
  components: {
    FaucetHeader,
    FaucetSidebar,
    FaucetFooter,
    LoadingSpinner,
    DepositApproved,
    DepositConfirmed,
    FeedbackNotification,
    ProgressModal,
    FeedbackAlert,
    RedelegateModal,
    UndelegateModal,
    WithdrawProgress,
    WithdrawConfirmed,
  },
  props: {
    data: Object,
  },
})
export default class Layout extends Vue {

  // get $state() { return (this.$store.state as DashboardState) }
  get s() { return (this.$store.state as DashboardState) }

  get walletType() { return this.s.ethereum.walletType }
  get showLoadingSpinner() { return false }

  get networkId() { return this.s.plasma.networkId }

  metamaskChangeAlert = false

  async mounted() {
    if ("ethereum" in window) {
      // @ts-ignore
      window.ethereum.on("accountsChanged", (accounts) => {
        // TODO: this is to resolve a bug with mismatched receipts, once all users are fixed, please remove.
        // @ts-ignore
        if (window.resolvingMismatchedReceipt) {
          return
        }

        if (this.$store.state.ethereum.address &&
          this.$store.state.ethereum.address !== accounts[0]) {
          localStorage.removeItem("lastWithdrawTime")
          this.metamaskChangeAlert = true
          // @ts-ignore
          window.ethereum.removeAllListeners()
        }

      })
    }

    this.$root.$on("logout", () => {
      this.restart()
    })

  }

  restart() {
    window.location.reload(true)
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

.beta-ribbon {
  position: absolute;
  left: -5px;
  top: -5px;
  z-index: 1000000000000;
  overflow: hidden;
  width: 75px;
  height: 75px;
  text-align: right;
  span {
    font-size: 10px;
    font-weight: bold;
    color: #FFF;
    text-transform: uppercase;
    text-align: center;
    line-height: 20px;
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    width: 100px;
    display: block;
    background: #F79E05;
    box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
    position: absolute;
    top: 19px;
    left: -21px;
    &::before {
      content: "";
      position: absolute;
      left: 0px;
      top: 100%;
      z-index: -1;
      border-left: 3px solid #8F5408;
      border-right: 3px solid transparent;
      border-bottom: 3px solid transparent;
      border-top: 3px solid #8F5408;
    }
    &::after {
      content: "";
      position: absolute;
      right: 0px;
      top: 100%;
      z-index: -1;
      border-left: 3px solid transparent;
      border-right: 3px solid #8F5408;
      border-bottom: 3px solid transparent;
      border-top: 3px solid #8F5408;
    }
  }
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


