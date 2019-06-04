<template>
  <div id="layout" class="d-flex flex-column" :class="getClassNameForStyling">
    <b-alert
      variant="light"
      :show="showSigningAlert"
      dismissible
      class="custom-notification text-center"
    >
      <strong>
        <fa :icon="['fa', 'bell']"/>
        {{ $t('Please sign the transaction on your wallet') }}
      </strong>
    </b-alert>
    <div v-if="networkId === 'us1'" style="background: #FFC107;padding: 0 16px;">Testnet</div>
    <faucet-header v-on:update:chain="refresh()"></faucet-header>
    <div class="content">
      <warning-overlay type="metamask"></warning-overlay>
      <warning-overlay type="mapping"></warning-overlay>
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

    <!-- gateway -->
    <DepositApproved/>
    <DepositConfirmed/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator"

import FaucetHeader from "@/components/FaucetHeader.vue"
import FaucetSidebar from "../components/FaucetSidebar.vue"
import FaucetFooter from "@/components/FaucetFooter.vue"
import LoadingSpinner from "../components/LoadingSpinner.vue"
import WarningOverlay from "../components/WarningOverlay.vue"

import DepositApproved from "@/components/gateway/DepositApproved.vue"
import DepositConfirmed from "@/components/gateway/DepositConfirmed.vue"
import { DashboardState } from "../types"
import { CommonTypedStore } from "../store/common"
import { DPOSTypedStore } from "../store/dpos-old"

@Component({
  components: {
    FaucetHeader,
    FaucetSidebar,
    FaucetFooter,
    LoadingSpinner,
    WarningOverlay,
    DepositApproved,
    DepositConfirmed,
  },
  props: {
    data: Object,
  },
})
export default class Layout extends Vue {

  // get $state() { return (this.$store.state as DashboardState) }
  get s() { return (this.$store.state as DashboardState) }

  get userIsLoggedIn() { return this.s.common.userIsLoggedIn }

  get walletType() { return this.s.DPOS.walletType }
  get showSidebar() { return this.s.DPOS.showSidebar }
  get currentMetamaskAddress() { return this.s.DPOS.currentMetamaskAddress }
  get showLoadingSpinner() { return this.s.DPOS.showLoadingSpinner }
  get showAlreadyMappedModal() { return this.s.DPOS.showAlreadyMappedModal }
  get showSignWalletModal() { return this.s.DPOS.showSignWalletModal }
  get mappingSuccess() { return this.s.DPOS.mappingSuccess }
  get status() { return this.s.DPOS.status }

  get account() { return this.s.DPOS.account }
  get showSigningAlert() { return this.s.DPOS.showSigningAlert }
  get metamaskError() { return this.s.DPOS.metamaskError }
  get mappingError() { return this.s.DPOS.mappingError }
  get networkId() { return this.s.plasma.networkId }

  setErrorMsg = CommonTypedStore.setErrorMsg
  initializeDependencies = DPOSTypedStore.initializeDependencies
  setMappingError = DPOSTypedStore.setMappingError
  setMappingStatus = DPOSTypedStore.setMappingStatus

  metamaskChangeAlert = false

  loginEmail = ""
  routeArray = [
    {
      className: "gradient-bg",
      routeNames: ["browse", "Browse Type", "card detail", "trade history", "Account",
        "Confirmed Package Purchase", "Card Pack"],
    },
  ]

  beforeMount() {
    if (!this.userIsLoggedIn) {
      this.$router.push({ path: "/login" })
    }
  }

  @Watch("mappingSuccess")
  onMappingSuccessChange(newValue, oldValue) {
    if (newValue && this.walletType === "metamask") {
      // @ts-ignore
      this.$router.push({
        name: "account",
      })
    }
  }

  @Watch("status")
  onMappedChange(newValue, oldValue) {
    if (newValue === "mapped" && this.walletType === "metamask") {
      this.$router.push({
        name: "account",
      })
    }
  }

  @Watch("showAlreadyMappedModal")
  onAlreadyMappedModalChange(newValue, oldValue) {
    if (newValue) {
      this.$root.$emit("bv::show::modal", "already-mapped")
    } else {
      this.$root.$emit("bv::hide::modal", "already-mapped")

    }
  }

  @Watch("showSignWalletModal")
  onSignLedgerModalChange(newValue, oldValue) {
    if (newValue) {
      this.$root.$emit("bv::show::modal", "sign-wallet-modal")
    } else {
      this.$root.$emit("bv::hide::modal", "sign-wallet-modal")
    }
  }

  async mounted() {
    // @ts-ignore
    if (this.$route.meta.requireDeps) {
      this.attemptToInitialize()
    }

    if ("ethereum" in window) {
      // @ts-ignore
      window.ethereum.on("accountsChanged", (accounts) => {
        // TODO: this is to resolve a bug with mismatched receipts, once all users are fixed, please remove.
        // @ts-ignore
        if (window.resolvingMismatchedReceipt) {
          return
        }

        if (this.currentMetamaskAddress &&
          this.currentMetamaskAddress !== accounts[0]) {
          localStorage.removeItem("lastWithdrawTime")
          this.metamaskChangeAlert = true
          // @ts-ignore
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
    } catch (err) {
      this.$root.$emit("logout")
      this.setMappingError(null)
      this.setMappingStatus("")
    }
  }

  get getClassNameForStyling() {
    let className = ""
    const self = this
    this.routeArray.forEach((item) => {
      // @ts-ignore
      if (item.routeNames.includes(self.$route.name)) {
        className = item.className
        return
      }
    })
    return className
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


