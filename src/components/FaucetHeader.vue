<template>
  <div id="faucet-header" ref="header" class="header">
    <feedback-notification class="custom-alert text-center"/>

    <div class="d-none d-lg-block">
      <nav class="navbar">
        <div class="container-fluid">
          <router-link to="/account" class="navbar-brand ml-3">
            <loom-icon width="18px" height="18px" :color="'#ffffff'"/>
            <span class="px-1">Plasmachain</span>
            <span class="beta-label">BETA</span>
          </router-link>
          <form class="form-inline">
            <LangSwitcher/>
          </form>
        </div>
      </nav>
    </div>

    <div class="d-lg-none">
      <nav class="mobile-navbar">
        <b-navbar toggleable="lg" type="dark">
          <div class="container d-flex justify-content-between ensure-padded">
            <a v-if="showBackButton" @click="$router.go(-1)" class="back-btn">
              <strong>Back</strong>
            </a>

            <b-navbar-brand href="#">
              <loom-icon :color="'#ffffff'"/>
            </b-navbar-brand>

            <b-navbar-toggle style="border: 0px;" target="nav_collapse"></b-navbar-toggle>
            <b-collapse is-nav id="nav_collapse">
              <!-- Right aligned nav items -->
              <b-navbar-nav class="mobile-nav ml-auto">
                <b-nav-item v-if="false">
                  <h5>
                    <router-link
                      to="/analytics"
                      class="router text-light hover-warning"
                    >{{ $t('components.faucet_sidebar.analytics') }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.staking" :key="index+'s'">
                  <h5>
                    <router-link
                      :to="menu.to"
                      class="router text-light hover-warning"
                    >{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.wallet" :key="index+'w'">
                  <h5>
                    <router-link
                      :to="menu.to"
                      class="router text-light hover-warning"
                    >{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.dev" :key="index+'d'">
                  <h5>
                    <router-link
                      :to="menu.to"
                      class="router text-light hover-warning"
                    >{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.help" :key="index+'h'">
                  <h5>
                    <router-link
                      :to="menu.to"
                      class="router text-light hover-warning"
                    >{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <LangSwitcher/>
                <b-nav-item v-if="!!state.plasma.address">
                  <h5>
                    <a @click="logout" class="router text-light hover-warning">Sign out</a>
                  </h5>
                </b-nav-item>
              </b-navbar-nav>
            </b-collapse>
          </div>
        </b-navbar>
      </nav>
    </div>
    <!-- Loading bar -->
    <loading-bar></loading-bar>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import ChainSelector from "./ChainSelector.vue"
import LoomIcon from "@/components/LoomIcon.vue"
import LangSwitcher from "./LangSwitcher.vue"
import { DashboardState } from "../types"
import LoadingBar from "@/feedback/components/LoadingBar.vue"
import FeedbackNotification from "@/feedback/components/FeedbackNotification.vue"

const MENU = {
  staking: [
    {
      to: "/validators",
      text: "components.faucet_sidebar.validators",
    },
    {
      to: "/account",
      text: "components.faucet_sidebar.my_account",
    },
    {
      to: "/history",
      text: "components.faucet_sidebar.history",
    },
  ],
  wallet: [
    {
      to: "/wallet",
      text: "components.faucet_sidebar.deposit_withdraw",
    },
    {
      to: "/game-assets",
      text: "components.faucet_sidebar.game_assets",
      name: "transfer-asset",
    },
  ],
  dev: [
    {
      to: "/",
      text: "components.faucet_sidebar.block_explorer",
    },
    {
      to: "/add-key",
      text: "components.faucet_sidebar.deploy_to_plasmachain",
      name: "dev-deploy",
    },
    {
      to: "/",
      text: "components.faucet_sidebar.transfer_gateway",
    },
    // {
    //   to: "/",
    //   text: "components.faucet_sidebar.validator_management",
    // },
  ],
  help: [
    {
      to: "/faq",
      text: "components.faucet_sidebar.faq",
    },
    {
      to: "/feedback",
      text: "components.faucet_sidebar.feedback_form",
    },
  ],
}

@Component({
  components: {
    ChainSelector,
    LangSwitcher,
    LoomIcon,
    LoadingBar,
    FeedbackNotification,
  },
  props: {
    hideDashboard: {
      type: Boolean,
      default: false,
    },
    hideWallet: {
      type: Boolean,
      default: true,
    },
    hideValidators: {
      type: Boolean,
      default: false,
    },
    hideMyStaking: {
      type: Boolean,
      default: true,
    },
    hideBlockExplorer: {
      type: Boolean,
      default: false,
    },
    hideLogOut: {
      type: Boolean,
      default: false,
    },
  },
})
export default class FaucetHeader extends Vue {

  timerRefreshInterval = null
  formattedTimeUntilElectionCycle = null

  electionCycleTimer = undefined
  showRefreshSpinner = false

  get menus() {
    return {
      staking: MENU.staking,
      wallet: MENU.wallet,
      dev: MENU.dev,
      help: MENU.help,
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get showLoadingBar(): boolean {
    return false
    // return this.state.whiteList
  }

  get showBackButton() {
    return this.$route.path.includes("login") || this.$route.path.includes("account") ? false : true
  }

  logout() {
    this.$root.$emit("logout")
  }
}
</script>
<style lang="scss">
.navbar {
  background: #5756e6;
  .navbar-brand {
    color: #ffffff;
  }
}

.mobile-navbar {
  .navbar {
    padding: 0;
    background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.13)
    );
    width: 100%;
    .navbar-brand {
      position: absolute;
      top: 4px;
      left: 50%;
      margin: 0;
      transform: translateX(-50%);
    }
  }
}

.refresh-icon {
  color: #007bff;
  &:hover {
    transform: rotate(360deg);
    transition: all 0.5s;
  }
}

.connection-status {
  width: 200px;
  flex: none;
}

a.hover-warning:hover {
  text-decoration: none;
  color: #f0ad4e !important;
}

.custom-alert {
  position: fixed;
  width: 100%;
  top: 0;
  font-weight: 600;
  margin-bottom: 0px;
  border: 0px;
  border-radius: 0px;
  z-index: 10100;
}

.ensure-padded {
  padding: 0 15px !important;
}

.navbar-toggler {
  border: 0px;
  position: relative;
  right: 0px;
  margin-left: auto;
  padding-right: 0;
}

.mobile-nav {
  padding: 12px 24px;
  h5 {
    margin: 0;
    font-size: 1rem;
  }
  li {
    list-style: none;
  }
}

.back-btn {
  strong {
    color: #ffffff;
  }
}

.beta-label {
  position: relative;
  bottom: 2px;
  display: inline;
  background: #f79e05;
  padding: 3px 8px;
  color: #ffffff;
  font-size: 0.5em;
  font-weight: bold;
  border-radius: 8px;
}
</style>

