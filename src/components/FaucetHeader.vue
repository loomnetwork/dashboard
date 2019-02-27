<template>
  <div id="faucet-header" @login="startPolling" ref="header" class="header">
    <b-navbar id="top-nav" toggleable="md" type="dark">
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
    </b-navbar>  -->

    <b-navbar variant="primary" class="bottom-bar" toggleable>
      <div class="inner-container">

        <div class="col-sm-2 col-md-3 v-center" v-if="userIsLoggedIn">
          <div class="footer-title">
            <img src="../assets/logo-grey.svg">
          </div>          
        </div>

        <div class="col-sm-10 col-md-9 v-center" v-if="userIsLoggedIn">           
          <b-navbar-nav class="hidden-medium">
            <b-nav-item>
              <div v-if="formattedTimeUntilElectionCycle">
                <div class="countdown-container">
                  <span>Next election cycle: </span><progress class="countdown-bar" :value="timeLeft" max="600" ref="electionCycleProgressBar"></progress>
                </div>            
                <b-tooltip target="countdown-container" placement="bottom">
                  <strong class="highlight">{{formattedTimeUntilElectionCycle}}</strong>
                </b-tooltip>
              </div>
              <div v-else>
                <div class="countdown-container">
                  <span>Next election cycle: </span><progress class="countdown-bar" value="600" max="600"></progress> 
                </div>
              </div>              
            </b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav>
            <div class="connectivity-status">
              <div class="router">
                <span>Ethereum
                  <div class="on-sign" v-if="connectedToMetamask"></div>
                  <div class="off-sign" v-else></div>            
                </span>
              </div>
              <div class="router">
                <span>DappChain
                  <div class="on-sign" v-if="connectedToDappChain"></div>
                  <div class="off-sign" v-else></div>            
                </span>
              </div>
            </div>            
          </b-navbar-nav>

          <b-navbar-nav>
            <div class="sub-menu-links hidden-tiny" v-if="!errorRefreshing">
              <b-nav-item v-if="isLoggedIn">
                <span id="mainnetBalance" class="mr-2">Mainnet: <strong class="highlight">{{this.userBalance.mainnetBalance}}</strong></span>
                <b-tooltip target="mainnetBalance" placement="bottom" title="This is your current balance in your connected wallet"></b-tooltip>
                <span id="dappchainBalance" class="mr-2">{{ $t('components.faucet_header.plasma_chain') }} <strong class="highlight">{{this.userBalance.isLoading ? 'loading' : formatLoomBalance}}</strong></span>
                <b-tooltip target="dappchainBalance" placement="bottom" title="This is the amount currently deposited to plasmachain"></b-tooltip>
                <span id="stakedAmount">{{ $t('components.faucet_header.staked') }} <strong class="highlight">{{this.userBalance.isLoading ? 'loading' : this.userBalance.stakedAmount}}</strong></span>
                <b-tooltip target="stakedAmount" placement="bottom" title="This is the total amount you have staked to validators"></b-tooltip>
              </b-nav-item>
            </div>
          </b-navbar-nav>
        </div>
      </div>
    </b-navbar>        
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
#top-nav {
  padding: 24px 0;
}
.header {
  background: #ffffff;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,.08);
  position: relative;
  z-index: 999;
  border: 0;  
  .navbar {
    padding: 0;
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

.inner-container {
  display: flex;
  width: 100%;
  ul {
    margin-left: auto;
  }
}

.footer-title {
  img {
    position: relative;
    left: -16px;
    width: 120px;
  }
}

.warning-prompt {
  
}

.v-center {
  display: flex;
  align-items: center;  
}

.countdown-container {
  display: flex;
  justify-content: center;
  align-content: center;
  span {
    display: inline-block;
    margin-right: 12px;
  }  
  .countdown-bar {
    position: relative;
    top: 2px;
  }
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

.cf:after {
  content: "";
  display: table;
  clear: both;
}

.bottom-bar {
  background-color: #ffffff !important;
  background-image: initial !important;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,.08);
  position: fixed;
  width: 100%;
  min-height: 56px;
  left: 0;
  bottom: 0;
  z-index: 999;  
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


</style>

  // form {
  //   flex-direction: column;
  //   align-items: normal;    
  // }