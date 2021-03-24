<template>
  <nav id="faucet-sidebar" vertical class="navbar-side">
    <header>
      <h6 class="rmv-spacing">{{ $t('components.faucet_sidebar.staking') }}</h6>
    </header>
    <b-nav class="staking" vertical>
      <b-nav-item
        v-if="state.env !== 'production'"
        to="/analytics"
        class="router"
        exact-active-class="router-active"
      >{{ $t('components.faucet_sidebar.analytics') }}</b-nav-item>
      <b-nav-item
        v-for="(menu, index) in menus.staking"
        :key="index"
        :to="menu.to"
        class="router"
        exact-active-class="router-active"
      >{{ $t(menu.text) }}</b-nav-item>
    </b-nav>
    <section>
      <header>
        <h6 class="rmv-spacing">{{ $t('components.faucet_sidebar.plasma_wallet') }}</h6>
      </header>
      <b-nav vertical>
        <b-nav-item
          v-for="(menu, index) in menus.wallet"
          :key="index"
          :to="menu.to"
          class="router"
          exact-active-class="router-active"
        >{{ $t(menu.text) }}</b-nav-item>
      </b-nav>
    </section>
    <section class="developer-menu">
      <header>
        <h6 class="rmv-spacing">{{ $t('components.faucet_sidebar.developers') }}</h6>
      </header>
      <b-nav vertical>
        <b-nav-item
          v-for="(menu, index) in menus.dev"
          :key="index"
          :to="menu.to"
          :href="menu.href"
          class="router"
          exact-active-class="router-active"
        >{{ $t(menu.text) }}</b-nav-item>
      </b-nav>
    </section>
    <section>
      <header>
        <h6 class="rmv-spacing">{{ $t('components.faucet_sidebar.help') }}</h6>
      </header>
      <b-nav vertical>
        <b-nav-item
          v-for="(menu, index) in menus.help"
          :key="index"
          :to="menu.to"
          class="router"
          exact-active-class="router-active"
        >{{ $t(menu.text) }}</b-nav-item>
      </b-nav>
    </section>
    <b-nav vertical>
      <b-nav-item
        v-if="!!state.plasma.address"
        @click="logout"
      >{{ $t('components.faucet_header.sign_out') }}</b-nav-item>
    </b-nav>
  </nav>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "../types"

@Component
export default class FaucetSidebar extends Vue {

  // we coud bind menu to this
  get menus() {
    return {
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
        // {
        //   to: "/analytics",
        //   text: "components.faucet_sidebar.analytics",
        // },
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
          href: this.state.plasma.blockExplorer,
          text: "components.faucet_sidebar.block_explorer",
        },
        {
          to: "/add-key",
          text: "components.faucet_sidebar.deploy_to_plasmachain",
          name: "dev-deploy",
        },
        {
          to: "/transfer-gateway",
          text: "components.faucet_sidebar.transfer_gateway",
        },
        {
          to: "/validator-management",
          text: "components.faucet_sidebar.validator_management",
        },
      ],
      help: [
        {
          to: "/staking-guide",
          text: "components.faucet_sidebar.staking_guide",
        },
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
  height: 100%;
  min-width: 245px;
  padding-top: 24px;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;

  section {
    padding: 10px 0;
  }

  header {
    font-weight: 300;
    font-size: 1.1rem;
    margin: 0 20px;
    padding: 0 0 5px;
  }
  a {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.8);
    margin: 0 20px;
    &.router-active {
      border-left: 5px solid #5756e6;
      padding-left: 10px;
      margin-left: 5px;
      font-weight: bold;
    }
  }
}

.developer-menu {
  background-color: rgb(98, 98, 98);
  color: #fff;

  a {
    color: #fff;
  }
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

.router .nav-link {
  padding: 0.3rem 0;
}
</style>
