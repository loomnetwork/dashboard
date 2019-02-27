<template>
  <div id="faucet-header" @login="startPolling" ref="header" class="header">
    <b-alert variant="warning"
             dismissible
             :show="!!showChromeWarning"
             class="text-center rmv-margin"
             ref="errorMsg">
      <span>Chrome is experiencing U2F errors with ledger on chrome 72, please use Opera or Brave instead</span>
    </b-alert>    
    <b-alert variant="danger"
               dismissible
               :show="!!showErrorMsg"
               class="custom-alert text-center"
               ref="errorMsg">
      {{this.$store.state.errorMsg}}
      </b-alert>
      <b-alert variant="success" class="custom-alert text-center" dismissible :show="!!showSuccessMsg" ref="successMsg">      
      <span class="text-dark" v-html="this.$store.state.successMsg"></span>
    </b-alert>   
    <b-navbar toggleable="md" type="dark">
      <div class="container-fluid d-flex justify-content-between ensure-padded">        
        <a @click="$router.push({path: '/validators'})">
          <b-navbar-brand>
            {{ $t('components.faucet_header.plasmachain_dashboard') }}
            <span v-if="connectedToMetamask" class="metamask-status">{{ $t('components.faucet_header.eth_connected') }}</span>
            <span v-else class="metamask-status metamask-status-error">{{ $t('components.faucet_header.eth_disconnected') }}</span>
            <span v-if="connectedToDappChain" class="metamask-status">{{ $t('components.faucet_header.dapp_connected') }}</span>
            <span v-else class="metamask-status metamask-status-error">{{ $t('components.faucet_header.dapp_disconnected') }}</span>
          </b-navbar-brand>
        </a>
        <b-navbar-toggle style="border: 0px;" target="nav_collapse"></b-navbar-toggle>
        <b-collapse is-nav id="nav_collapse">

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            
            <b-nav-form>
              <b-nav-item :hidden="false">
                <router-link to="/account" class="router text-light hover-warning">{{ $t('views.history.home') }}</router-link>
              </b-nav-item>
              <b-nav-item :hidden="isLoggedIn">
                <router-link to="/validators" class="router text-light hover-warning">{{ $t('views.validator_list.validators') }}</router-link>
              </b-nav-item>
              <b-nav-item :hidden="true">
                <router-link to="/blockexplorer" class="router text-light hover-warning">{{ $t('components.faucet_header.explorer') }}</router-link>
              </b-nav-item>   
              <b-nav-item :hidden="false">
                <router-link to="/faq" class="router text-light hover-warning">{{ $t('components.faucet_header.f_a_q') }}</router-link>
              </b-nav-item>
              <b-nav-item :hidden="false">
                <LangSwitcher/>
              </b-nav-item>
            </b-nav-form>

          </b-navbar-nav>
        </b-collapse>        
      </div>
    </b-navbar> 
    <b-navbar type="dark" variant="primary" class="top-nav" toggleable>
      <div class="container-fluid ensure-padded">

        <div class="col" v-if="userIsLoggedIn">
          <b-navbar-nav v-if="formattedTimeUntilElectionCycle">
            <div id="countdown-container">
              <progress :value="timeLeft" max="600" ref="electionCycleProgressBar"></progress>
            </div>            
            <b-tooltip target="countdown-container" placement="bottom">
              <span>{{ $t('components.faucet_header.next_election_cycle') }}</span> <strong class="highlight">{{formattedTimeUntilElectionCycle}}</strong>
            </b-tooltip>
          </b-navbar-nav>      
        </div>

        <div class="col">          
          <b-navbar-nav>
            <div class="sub-menu-links" v-if="!errorRefreshing">
              <b-nav-item v-if="isLoggedIn" class="mr-3">
                <span id="mainnetBalance" class="mr-2">{{ $t('views.my_account.mainnet') }} <strong class="highlight">{{this.userBalance.isLoading ? 'loading' : this.userBalance.mainnetBalance}}</strong></span>
                <b-tooltip target="mainnetBalance" placement="bottom" title="This is your current balance in your connected wallet"></b-tooltip>
                <span id="dappchainBalance" class="mr-2">{{ $t('components.faucet_header.plasma_chain') }} <strong class="highlight">{{this.userBalance.isLoading ? 'loading' : formatLoomBalance}}</strong></span>
                <b-tooltip target="dappchainBalance" placement="bottom" title="This is the amount currently deposited to plasmachain"></b-tooltip>
                <span id="stakedAmount">{{ $t('components.faucet_header.staked') }} <strong class="highlight">{{this.userBalance.isLoading ? 'loading' : this.userBalance.stakedAmount}}</strong></span>
                <b-tooltip target="stakedAmount" placement="bottom" title="This is the total amount you have staked to validators"></b-tooltip>
              </b-nav-item>
              <b-nav-item v-if="isLoggedIn" :hidden="false" class="add-border-left pl-3">
                <a @click="logOut" class="sign-out-link">{{ $t('views.first_page.sign_out') }}</a>
              </b-nav-item>          
            </div>
            <!-- <b-nav-item :hidden="false" style="margin-left: auto;">
              <a @click="logOut" class="sign-out-link">{{ $t('views.first_page.sign_out') }}</a>
            </b-nav-item>                  -->
            <!-- <b-nav-item-dropdown id="balance" style="margin-left: auto;" :text="balance" right>
              <router-link to="/blockexplorer" class="router text-light hover-warning">
                <b-dropdown-item href="#">{{ $t('components.faucet_header.deposit') }}</b-dropdown-item>
              </router-link>
              <b-dropdown-item href="#">{{ $t('views.my_account.withdraw') }}</b-dropdown-item>
              <b-dropdown-item @click="logOut">{{ $t('views.first_page.sign_out') }}</b-dropdown-item>
            </b-nav-item-dropdown> -->
          </b-navbar-nav>
        </div>
      </div>
    </b-navbar>        
    <!-- <nav class="block-foreground d-flex navbar navbar-dark navbar-expand-md ext-uppercase app-navbar mb-0 justify-content-between">
      <div class="container d-flex justify-content-between">
        <a class="navbar-brand col-lg-3 col-md-3" href="https://loomx.io/">
          {{ $t('components.faucet_header.plasmachain_dashboard') }}
        </a>
        <b-collapse is-nav id="nav_dropdown_collapse">
          <b-nav class="col-lg-5 offset-md-1 col-md-6">
            <login-account-modal ref="loginAccountRef" @onLogin="onLoginAccount"/>
            <b-nav-item :hidden="hideDashboard">
              <router-link to="/account" class="router text-light hover-warning">{{ $t('components.faucet_header.dashboard') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="hideWallet">
              <router-link to="/account" class="router text-light hover-warning">{{ $t('components.faucet_header.wallet') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="hideValidators">
              <router-link to="/" class="router text-light hover-warning">{{ $t('views.validator_list.validators') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="hideMyStaking">
              <router-link to="/validators" class="router text-light hover-warning">{{ $t('components.faucet_header.my_staking') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="hideBlockExplorer">
              <router-link to="/blockexplorer" class="router text-light hover-warning">{{ $t('components.faucet_header.block_explorer') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="false">
              <router-link to="/blockexplorer" class="router text-light hover-warning">{{ $t('views.validator_list.validators') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="false">
              <router-link to="/blockexplorer" class="router text-light hover-warning">{{ $t('components.faucet_header.my_stakes') }}</router-link>
            </b-nav-item>
            <b-nav-item :hidden="false">
              <router-link to="/blockexplorer" class="router text-light hover-warning">{{ $t('components.faucet_header.status') }}</router-link>
            </b-nav-item>                              
          </b-nav>
        </b-collapse>
        <b-nav class="offset-lg-2 col-lg-2 col-md-2">
          <b-nav-item :hidden="hideLogOut">
            <a @click.prevent="login" class="router text-light hover-warning">{{loginText}}</a>
          </b-nav-item>      
        </b-nav>        
      </div>
      <b-alert variant="danger"
               dismissible
               :show="!!showErrorMsg"
               class="custom-alert"
               ref="errorMsg"
      >
        {{this.$store.state.errorMsg}}
      </b-alert>
      <b-alert variant="success" class="custom-alert" dismissible :show="!!showSuccessMsg" ref="successMsg">
      <span class="text-dark" v-html="this.$store.state.successMsg"></span>
    </b-alert>
    </nav> -->  
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import ChainSelector from './ChainSelector'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import LangSwitcher from './LangSwitcher'

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    ChainSelector,
    LangSwitcher
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
  methods: {
    ...mapMutations([
      'setUserIsLoggedIn'
    ]),
    ...DPOSStore.mapMutations([
      'setUserBalance'
    ]),
    ...DPOSStore.mapActions(['clearPrivateKey', 'connectToMetamask', 'getTimeUntilElectionsAsync']),
    ...DappChainStore.mapActions([
      'addChainUrl',
      'getDappchainLoomBalance',
      'getMetamaskLoomBalance',
      'getAccumulatedStakingAmount'
    ]),
    
  },
  computed: {
    ...mapState([
      'userIsLoggedIn',
      'errorMsg',
      'successMsg'
    ]),
    ...DPOSStore.mapState([
      'web3',
      'connectedToMetamask',
      'currentMetamaskAddress',
      'userBalance',
      'status',
      'timeUntilElectionCycle'
    ]),
    ...DappChainStore.mapState([
      'chainUrls',
      'isConnectedToDappChain'
    ]),
    ...DappChainStore.mapGetters([
      'currentChain',
    ])
  },
})

export default class FaucetHeader extends Vue {

  refreshInterval = null
  timerRefreshInterval = null
  formattedTimeUntilElectionCycle = null
  timeLeft = 600
  errorRefreshing = false
  connectedToDappChain = false 

  electionCycleTimer = undefined

  logOut() {
    this.clearPrivateKey()
    localStorage.removeItem("userIsLoggedIn")
    this.setUserIsLoggedIn(false)
    this.$router.push({ path: '/login' })
  }

  login() {
    if (this.userIsLoggedIn) {
      this.logOut()
      return
    }
    this.$router.push({ path: '/login' })
    // this.$root.$emit('bv::show::modal', 'login-account-modal')
  }

  @Watch('isConnectedToDappChain')
    onConnectingToDappChainChange(newValue, oldValue) {
    if(newValue) {
      this.connectedToDappChain = true
    } else {
      this.connectedToDappChain = false
    }
  }

  mounted() { 
    this.$root.$on('initialized', async () => {
      await this.pollingHandler()
    })    

    this.$root.$on('logout', () => {
      this.deleteIntervals()
      this.logOut()
    })

  }

  async pollingHandler() {
    if(this.userIsLoggedIn) {
      this.startPolling()
       // Get time until next election cycle
       await this.updateTimeUntilElectionCycle()
       this.startTimer()
    } else {
      this.$root.$on('login', async () => {
        this.startPolling()
        await this.updateTimeUntilElectionCycle()
        this.startTimer()        
      })
    }
  }

  startTimer() {
    this.timerRefreshInterval = setInterval(async () => this.decreaseTimer(), 1000)
  }

  async updateTimeUntilElectionCycle() {
    await this.getTimeUntilElectionsAsync()
    this.electionCycleTimer = this.timeUntilElectionCycle    
  }

  async decreaseTimer() {
    if(this.electionCycleTimer) {
      let timeLeft = parseInt(this.electionCycleTimer)      
      if(timeLeft > 0) {
        timeLeft--
        this.timeLeft = timeLeft
        this.electionCycleTimer = timeLeft.toString()
        this.showTimeUntilElectionCycle()
      } else {
        await this.updateTimeUntilElectionCycle()
      }
    }
    
  }

  startPolling() {
    if(this.userIsLoggedIn) {
      this.refreshInterval = setInterval(async () => this.refresh(), 5000)
    }
  }
  
  destroyed() {
    this.deleteIntervals()
  }

  deleteIntervals() {
    if(this.refreshInterval) clearInterval(this.refreshInterval)
    if(this.timerRefreshInterval) clearInterval(this.timerRefreshInterval)    
  }


  get loginText() {
    return this.userIsLoggedIn ? 'Log Out' : 'Log In'
  }

  get showChromeWarning() {
    return (!!window.chrome && 
           (!!window.chrome.webstore || !!window.chrome.runtime)) ? true : false
  }

  async refresh() {
    if(this.status !== 'mapped') return
    try {
      let loomBalance = await this.getDappchainLoomBalance()
      let mainnetBalance = await this.getMetamaskLoomBalance({
        web3: this.web3,
        address: this.currentMetamaskAddress
      })
      let stakedAmount = await this.getAccumulatedStakingAmount()
      let isLoading = false
      this.setUserBalance({
        isLoading,
        loomBalance,
        mainnetBalance,
        stakedAmount
      })
      this.errorRefreshing = false
    } catch(err) {
      this.errorRefreshing = true
    }
  }

  onLoginAccount() {
    this.$emit('onLogin')
  }

  onConnectionUrlChanged(newUrl) {
    this.$emit('update:chain')
    // this.blockchain.setServerUrl(newUrl)
  }

  async onUserInputUrl(url){
    if (await this.addChainUrl({ url })) {
      this.onConnectionUrlChanged(url)
    }
  }

  get isLoggedIn() {
    return this.userIsLoggedIn ? true : false
  }

  get showErrorMsg() {
    /*
    message opt can be like
    {
      stay: true, // if you don't want it be auto hidden, set it to true
      waitTime: 5 // define how long do you want it to stay
    }
     */
    if(this.$store.state.errorMsg) {
      this.hideAlert({
        opt: this.$store.state.msgOpt,
        ref: this.$refs.errorMsg
      })
    }
    return this.$store.state.errorMsg ? { message: this.$store.state.errorMsg, variant: 'error' } : false
  }

  get showSuccessMsg() {
    if(this.$store.state.successMsg) {
      this.hideAlert({
        opt: this.$store.state.msgOpt,
        ref: this.$refs.successMsg
      })
    }
    return this.$store.state.successMsg ? { message: this.$store.state.successMsg, variant: 'success' } : false
  }

  get formatLoomBalance() {
      return this.userBalance.loomBalance.toString()
  }

  showTimeUntilElectionCycle() {    
    if(this.electionCycleTimer) {
      let timeLeft = this.electionCycleTimer
      let date = new Date(null)
      date.setSeconds(timeLeft)
      let result = date.toISOString().substr(11, 8)
      this.formattedTimeUntilElectionCycle = result
    } else {
      this.formattedTimeUntilElectionCycle = ""      
    }
  }

  hideAlert(alertOpt){
    let stay = alertOpt.opt ? alertOpt.opt.stay : false
    let waitTime = alertOpt.opt ? alertOpt.opt.waitTime : 4
    if(!stay){
      setTimeout(()=>{
        if (alertOpt.ref) {
          try {
            alertOpt.ref.dismiss()
          } catch (e) {}
        }
      }, waitTime * 1000)
    }
  }
}</script>
<style lang="scss">
.header {
  background: #5756e6;
  .navbar {
    padding: 0;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.13));
    width: 100%;
    .navbar-brand {
      display: block;
      padding: 0;
      img {
        height: 56px;
      };
      .router {
        color: white;
        font-size: 18px;
      }
    }
  }
}

.rmv-margin {
  margin: 0;
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
  position: absolute;
  width: 100%;  
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

// #balance::after {
//   position: absolute;
//   content: "Staked / Available";
//   font-size: 9px;
//   color: #ffffff;
//   bottom: 6px;
//   left: 8px;
// }

.add-border-left {
  border-left: 2px solid #f2f1f3;
}

</style>

  // form {
  //   flex-direction: column;
  //   align-items: normal;    
  // }