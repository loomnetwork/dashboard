<template>
  <div id="faucet-header" ref="header" class="header">
    <b-alert
      variant="danger"
      dismissible
      :show="!!showErrorMsg"
      class="custom-alert text-center"
      ref="errorMsg"
    >{{state.common.errorMsg}}</b-alert>

    <b-alert
      variant="success"
      class="custom-alert text-center"
      dismissible
      :show="!!showSuccessMsg"
      ref="successMsg"
    >
      <span class="text-dark" v-html="state.common.successMsg"></span>
    </b-alert>

    <feedback-notification class="custom-alert text-center"/>

    <div class="d-none d-lg-block">
      <nav class="navbar">
        <div class="container-fluid">
          <router-link to="/account" class="navbar-brand">
            <loom-icon width="18px" height="18px" :color="'#ffffff'"/>Plasmachain
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
                    <router-link to="/analytics" class="router text-light hover-warning">{{ $t('components.faucet_sidebar.analytics') }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.staking" :key="index">
                  <h5>
                    <router-link :to="menu.to" class="router text-light hover-warning">{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.wallet" :key="index">
                  <h5>
                    <router-link :to="menu.to" class="router text-light hover-warning">{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.dev" :key="index">
                  <h5>
                    <router-link :to="menu.to" class="router text-light hover-warning">{{ $t(menu.text) }}</router-link>
                  </h5>
                </b-nav-item>
                <b-nav-item v-for="(menu, index) in menus.help" :key="index">
                  <h5>
                    <router-link :to="menu.to" class="router text-light hover-warning">{{ $t(menu.text) }}</router-link>
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
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import ChainSelector from "./ChainSelector.vue"
import LoomIcon from "@/components/LoomIcon.vue"
import LangSwitcher from "./LangSwitcher.vue"
import { DashboardState } from "../types"
import FeedbackNotification from "@/feedback/components/FeedbackNotification.vue"

@Component({
  components: {
    ChainSelector,
    LangSwitcher,
    LoomIcon,
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

  menus = {
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
      {
        to: "/",
        text: "components.faucet_sidebar.validator_management",
      },
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
    ]
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get showBackButton() {
    return this.$route.path.includes("login") ? false : true
  }

  get isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? true : false
  }

  get isLoggedIn() {
    return this.state.common.userIsLoggedIn ? true : false
  }

  get showErrorMsg() {
    if (this.state.common.errorMsg) {
      this.hideAlert({
        opt: this.$store.state.msgOpt,
        ref: this.$refs.errorMsg,
      })
    }
    return this.state.common.errorMsg ? { message: this.state.common.errorMsg, variant: "error" } : false
  }

  get showSuccessMsg() {
    if (this.state.common.successMsg) {
      this.hideAlert({
        opt: this.$store.state.msgOpt,
        ref: this.$refs.successMsg,
      })
    }
    return this.state.common.successMsg ? { message: this.state.common.successMsg, variant: "success" } : false
  }

  hideAlert(alertOpt) {
    const stay = alertOpt.opt ? alertOpt.opt.stay : false
    const waitTime = alertOpt.opt ? alertOpt.opt.waitTime : 4

    if (!stay) {
      setTimeout(() => {
        if (alertOpt.ref) {
          try {
            alertOpt.ref.dismiss() // set dismissed to true
            this.state.common.errorMsg = ""
          } catch (e) {
            console.error(e)
          }
        }
      }, waitTime * 1000)
    }
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

.rmv-margin {
  margin: 0;
}

.refresh-icon {
  color: #6eb1ff;
  &:hover {
    transform: rotate(360deg);
    transition: all 0.5s;
  }
}

#countdown-container {
  display: flex;
  justify-content: center;
  align-content: center;
  margin-right: auto;
}

.sign-out-link {
  color: #007bff !important;
}

.sub-menu-links {
  display: flex;
  margin-left: auto;
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

.cf:after {
  content: "";
  display: table;
  clear: both;
}

.top-nav {
  background-color: #ffffff !important;
  background-image: initial !important;
  border-bottom: 2px solid #f2f1f3;
  .col {
    padding: 0px;
    ul {
      li {
        a {
          span {
            color: #495057;
          }
        }
      }
    }
  }
}

.ensure-padded {
  padding: 0 15px !important;
}

#balance {
  padding: 6px 0;
  position: relative;
}

.metamask-status {
  position: relative;
  bottom: 2px;
  background-color: #0dcd9b;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  border-radius: 5px;
  padding: 2px 6px;
  font-weight: bold;
}

.metamask-status-error {
  background-color: #e62e2e;
}

.add-border-left {
  border-left: 2px solid #f2f1f3;
}

.navbar-toggler {
  border: 0px;
  position: relative;
  right: 0px;
  margin-left: auto;
  padding-right: 0;
}

.mobile-nav {
  text-align: center;
  padding: 12px 0;
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
</style>

