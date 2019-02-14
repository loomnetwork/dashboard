<template>
  <b-nav id="faucet-sidebar" vertical class="navbar-side">
    <b-nav-item>
      <router-link to="/validators" class="router" exact-active-class="router-active">Validators</router-link>
    </b-nav-item>    
    <div id="restricted-access-links">
      <b-nav-item>
        <router-link to="/account" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active">My Account</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link to="/delegations" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active">My Delegations</router-link>
      </b-nav-item>
      <b-nav-item>
        <router-link to="/rewards" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active">Rewards</router-link>
      </b-nav-item>  
    </div>
    <b-tooltip v-if="!userIsLoggedIn" target="restricted-access-links" placement="left">
      Please <router-link class="login-link" to="/login">login</router-link> to gain access
    </b-tooltip>
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
}</script>
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
