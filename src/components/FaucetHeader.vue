<template>
  <div id="faucet-header" @login="startPolling" ref="header" class="header">

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

    <nav>
      <b-navbar toggleable="md" type="dark">
        <div class="container-fluid d-flex justify-content-between ensure-padded">        

          <b-navbar-brand href="#">
            <loom-icon :color="'#ffffff'"/>
          </b-navbar-brand>

          <b-navbar-toggle style="border: 0px;" target="nav_collapse"></b-navbar-toggle>
          <b-collapse is-nav id="nav_collapse">

            <!-- Right aligned nav items -->
            <b-navbar-nav class="mobile-nav ml-auto">
              
              <b-nav-item>
                <h5>
                  <router-link to="/account" class="router text-light hover-warning">Account</router-link>
                </h5>
              </b-nav-item>
              <b-nav-item>
                <h5>
                  <router-link to="/history" class="router text-light hover-warning">History</router-link>
                </h5>
              </b-nav-item>
              <b-nav-item>
                <h5>
                  <router-link to="/validators" class="router text-light hover-warning">Validators</router-link>
                </h5>
              </b-nav-item>

            </b-navbar-nav>
          </b-collapse>        
        </div>
      </b-navbar> 
    </nav>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import ChainSelector from './ChainSelector'
import LoomIcon from '@/components/LoomIcon'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import LangSwitcher from './LangSwitcher'

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    ChainSelector,
    LangSwitcher,
    LoomIcon
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
      'setUserBalance',
      'setShowLoadingSpinner'
    ]),
    ...DPOSStore.mapActions(['clearPrivateKey', 'connectToMetamask', 'getTimeUntilElectionsAsync']),
    ...DappChainStore.mapActions([
      'addChainUrl',
      'getDappchainLoomBalance',
      'getMetamaskLoomBalance',
      'getAccumulatedStakingAmount'
    ]),
    ...DappChainStore.mapMutations([
      'setMappingError',
      'setMappingStatus'
    ]) 
    
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
      'isConnectedToDappChain',
      'mappingStatus'
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
  showRefreshSpinner = false

  logOut() {
    this.clearPrivateKey()
    sessionStorage.removeItem("userIsLoggedIn")
    this.setUserIsLoggedIn(false)
    this.setMappingError(null)
    this.setMappingStatus(null)
    this.setShowLoadingSpinner(false)
    window.location.reload(true)
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

  testHide() {
    this.$emit("bv::toggle::collapse", "nav_collapse", false);
  }

  async mounted() { 

    // Start election cycle timer
    // this.$root.$on('initialized', async () => {
    //   await this.updateTimeUntilElectionCycle()
    //   this.startTimer()
    // })

    // Listen to refreshBalances event
    this.$root.$on('refreshBalances', async () => {
      await this.refresh()
    })

    this.$root.$on('logout', () => {
      this.logOut()
    })

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
      this.showRefreshSpinner = true
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
      this.showRefreshSpinner = false
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
}
</script>
<style lang="scss">
.header {
  background: #5756e6;
  .navbar {
    padding: 0;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.13));
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
    transform:rotate(360deg);
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
  li {
    list-style: none;
  } 
}

</style>

  // form {
  //   flex-direction: column;
  //   align-items: normal;    
  // }