<template>
  <b-nav id="faucet-sidebar" vertical class="navbar-side">
    <b-nav-item>
      <router-link to="/analytics" class="router" exact-active-class="router-active">{{ $t('components.faucet_sidebar.analytics') }}</router-link>
    </b-nav-item>      
    <b-nav-item>
      <router-link to="/validators" class="router" exact-active-class="router-active">{{ $t('components.faucet_sidebar.validators') }}</router-link>
    </b-nav-item>  
    <div id="restricted-access-links" @click="clickHandler">
      <b-nav-item>
        <router-link to="/account" class="router" exact-active-class="router-active">{{ $t('components.faucet_sidebar.my_account') }}</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link to="/history" class="router" exact-active-class="router-active">{{ $t('components.faucet_sidebar.history') }}</router-link>
      </b-nav-item>      
    </div>
    <hr>
    <b-nav-item>
      <router-link to="/blockexplorer" class="router" exact-active-class="router-active">{{ $t('components.faucet_header.block_explorer') }}</router-link>
    </b-nav-item>
    <b-nav-item>
      <router-link to="/faq" class="router" exact-active-class="router-active">{{ $t('components.faucet_sidebar.faq') }}</router-link>
    </b-nav-item>
    <b-nav-item v-if="userIsLoggedIn">
      <a class="nav-link">
        <a @click="logout">
          Sign out
        </a>        
      </a>
    </b-nav-item>
  </b-nav>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

@Component({
  computed: {
    ...mapState(['userIsLoggedIn'])
  }
})

export default class FaucetSidebar extends Vue {

  clickHandler() {
    if(!this.userIsLoggedIn) this.$router.push({ path: '/login' })
    return
  }

  logout() {
    this.$root.$emit('logout')
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
  font-weight: bold
}
.router {
  color: gray;
  padding: 5px 15px;
}
.column {
  flex-direction: column;
}
h4, h1 {
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
