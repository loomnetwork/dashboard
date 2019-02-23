<template>
  <b-nav id="faucet-sidebar" vertical class="navbar-side">

    <div class="d-none d-sm-none d-md-none d-lg-block">
      <a @click="$router.push({path: '/validators'})">
        <b-navbar-brand>
          DPOS Dashboard
          <!-- <span v-if="connectedToMetamask" class="metamask-status">connected</span>
          <span v-else class="metamask-status metamask-status-error">disconnected</span> -->
        </b-navbar-brand>
      </a>
      <router-link to="/validators" class="router" exact-active-class="router-active">
        <span><fa icon="chess-rook" class="sidebar-icon"/>Validators</span>
      </router-link>
      <router-link to="/blockexplorer" class="router" exact-active-class="router-active"><span><fa icon="code-branch" class="sidebar-icon"/>Blockexplorer</span></router-link>
      <div id="restricted-access-links" @click="clickHandler">
        <router-link to="/account" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active"><span><fa icon="user-circle" class="sidebar-icon"/>My Account</span></router-link>
        <router-link to="/delegations" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active"><span><fa icon="list" class="sidebar-icon"/>My Delegations</span></router-link>
        <router-link to="/rewards" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active"><span><fa icon="coins" class="sidebar-icon"/>Rewards</span></router-link>
      </div>

      <div v-if="userIsLoggedIn" :hidden="false" class="router">
        <span @click="logOut" class="sign-out-link">{{ $t('views.first_page.sign_out') }}</span>
      </div>         


    </div>

    <div class="mobile-sidebar d-sm-block d-md-block d-lg-none">
      <div class="row rmv-spacing">
        <div class="col">
          <a @click="$router.push({path: '/validators'})">
            <b-navbar-brand>
              DPOS Dashboard
              <!-- <span v-if="connectedToMetamask" class="metamask-status">connected</span>
              <span v-else class="metamask-status metamask-status-error">disconnected</span> -->
            </b-navbar-brand>
          </a>
        </div>
        <div class="col menu-toggle-container">
          <b-navbar-toggle style="border: 0px; margin-left: auto;" target="nav_collapse"><fa icon="bars" class="sidebar-icon"/></b-navbar-toggle>
        </div>
      </div>
      <div class="row">
        <div class="col">
        
        <b-collapse is-nav id="nav_collapse">

          <router-link to="/validators" class="router" exact-active-class="router-active">
            <span><fa icon="chess-rook" class="sidebar-icon"/>Validators</span>
          </router-link>
          <router-link to="/blockexplorer" class="router" exact-active-class="router-active"><span><fa icon="code-branch" class="sidebar-icon"/>Blockexplorer</span></router-link>
          <div id="restricted-access-links" @click="clickHandler">
            <router-link to="/account" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active"><span><fa icon="user-circle" class="sidebar-icon"/>My Account</span></router-link>
            <router-link to="/delegations" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active"><span><fa icon="list" class="sidebar-icon"/>My Delegations</span></router-link>
            <router-link to="/rewards" :class="[ !userIsLoggedIn ? 'router disabled' : 'router' ]" exact-active-class="router-active"><span><fa icon="coins" class="sidebar-icon"/>Rewards</span></router-link>
          </div>   

        </b-collapse>    
       
        </div>
      </div>
    </div>


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

  logOut() {

  }

}
</script>
<style lang="scss" scoped>
.navbar-side {
  background-color: #ffffff;
  z-index: 100;
  position: fixed;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,.08);
  height: 100%;
  min-width: 230px;
  padding-top: 24px;
  font-size: 16px;
  font-weight: bold;
}
.navbar-brand {
  padding: 12px 36px;
}
.router-active {
  border-left: 5px solid #5756e6;
  background-color: #f9f9fc;
  font-weight: bold
}
.router {
  display: block;
  color: #6e6f96;
  font-size: 16px;
  font-weight: 400;
  &:hover {
    background-color: #f9f9fc;
    text-decoration: none;
  }
  span {
    display: block;
    padding: 12px 36px;
    .sidebar-icon {
      margin-right: 12px;
    }
  }
}
.column {
  flex-direction: column;
}
.mobile-sidebar {
  width: 100%;
}
h4, h1 {
  color: #6e6f96;
}
.text-gray {
  color: #6e6f96;
}
.disabled {
  pointer-events: none;
  opacity: 0.6;
}
.login-link {
  color: #007bff;
}

.menu-toggle-container {
  display: flex;
}

</style>
