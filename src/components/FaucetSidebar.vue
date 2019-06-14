<template>
  <b-nav id="faucet-sidebar" vertical class="navbar-side">
    <b-nav-item v-if="false">
      <!-- hide until v3 -->
      <router-link
        to="/analytics"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.analytics') }}</router-link>
    </b-nav-item>
    <b-nav-item v-for="(menu, index) in normalMenu" :key="index">
      <router-link
        :to="menu.to"
        class="router"
        exact-active-class="router-active"
      >{{ $t(menu.text) }}</router-link>
    </b-nav-item>
    <div class="developer-menu">
      <b-nav-item v-for="(menu, index) in devMenu" :key="index" >
        <router-link
          :to="menu.to"
          class="router"
          exact-active-class="router-active"
        >{{ $t(menu.text) }}</router-link>
      </b-nav-item>
    </div>
    <b-nav-item v-if="!!state.plasma.address">
      <a class="nav-link">
        <a @click="logout">Sign out</a>
      </a>
    </b-nav-item>
  </b-nav>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "../types"

@Component
export default class FaucetSidebar extends Vue {

  // we coud bind menu to this
  menu = {
    normal: [
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
      {
        to: "/feedback",
        text: "components.faucet_sidebar.feedback_form",
      },
      {
        to: "/wallet",
        text: "components.faucet_sidebar.deposit_withdraw",
      },
      {
        to: "/game-assets",
        text: "components.faucet_sidebar.game_assets",
        name: "transfer-asset",
      },
      {
        to: "/faq",
        text: "components.faucet_sidebar.faq",
      },
    ],
    devMenu: [
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
  }

  get normalMenu() {
    const disable = this.state.disabled
    return this.menu.normal.filter((menu) => !disable.includes(menu.name || ""))
  }

  get devMenu() {
    const disable = this.state.disabled
    return this.menu.devMenu.filter((menu) => !disable.includes(menu.name || ""))
  }

  get state(): DashboardState {
    return this.$store.state
  }

  logout() {
    this.$root.$emit("logout")
  }

}
</script>
<style lang="scss" scoped>
.navbar-side {
  background-color: #ffffff;
  z-index: 100;
  position: relative;
  border-right: 2px solid #f2f1f3;
  height: 100%;
  min-width: 245px;
  padding-top: 24px;
  font-size: 16px;
  font-weight: bold;
}
.router-active {
  border-left: 5px solid #5756e6;
  font-weight: bold;
}
.router {
  font-size: 16px;
  font-weight: 600;
  color: gray;
  padding: 5px 15px;
}
.developer-menu {
  margin: 16px 0;
  background-color: gray;
  a {
    color: white;
  }
}
.column {
  flex-direction: column;
}
h4,
h1 {
  color: gray;
}
.text-gray {
  color: gray;
}
.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.login-link {
  color: #007bff;
}
</style>
