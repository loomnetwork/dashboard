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
    <b-nav-item>
      <router-link
        to="/validators"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.validators') }}</router-link>
    </b-nav-item>
    <b-nav-item>
      <router-link
        to="/account"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.my_account') }}</router-link>
    </b-nav-item>
    <b-nav-item>
      <router-link
        to="/history"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.history') }}</router-link>
    </b-nav-item>
    <hr>
    <b-nav-item>
      <router-link
        to="/wallet"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.deposit_withdraw') }}</router-link>
    </b-nav-item>
    <b-nav-item>
      <router-link
        to="/game-assets"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.game_assets') }}</router-link>
    </b-nav-item>
    <b-nav-item>
      <router-link
        to="/faq"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.faq') }}</router-link>
    </b-nav-item>
    <div class="developer-menu">
      <b-nav-item>
        <router-link
          to="/"
          class="router"
          exact-active-class="router-active"
        >{{ $t('components.faucet_sidebar.block_explorer') }}</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link
          to="/add-key"
          class="router"
          exact-active-class="router-active"
        >{{ $t('components.faucet_sidebar.deploy_to_plasmachain') }}</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link
          to="/"
          class="router"
          exact-active-class="router-active"
        >{{ $t('components.faucet_sidebar.transfer_gateway') }}</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link
          to="/"
          class="router"
          exact-active-class="router-active"
        >{{ $t('components.faucet_sidebar.validator_management') }}</router-link>
      </b-nav-item>
    </div>
    <b-nav-item v-if="state.common.userIsLoggedIn">
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


  menu = [
    {},
    {},
    {},
  ]

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
  min-width: 230px;
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
  font-weight: normal;
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
