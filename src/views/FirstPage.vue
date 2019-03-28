<!-- PlasmaChain Delegators -->
<template>
  <div class="">
    <div class="pt-3">
      <main>
        <!-- <login-account-modal ref="loginAccountRef" @ok="onLoginAccount" @onLogin="onLoginAccount"/> -->
        <!-- <create-account-modal ref="createAccountRef" @ok="onCreateAcount"></create-account-modal> -->
        <seed-phrase-modal ref="seedPhraseRef" @ok="onGenerateSeeds"/>
        <confirm-seed-modal ref="confirmSeedRef" @ok="onConfirmSeeds"/>
        <restore-account-modal ref="restoreAccountModal" @ok="onRestoreAccount"/>
        <hardware-wallet-modal ref="hardwareWalletConfigRef" @ok="onWalletConfig"/>
        <div class="container-fluid mb-5 rmv-padding">
     
          <b-card title="Select wallet">
            <div class="row wallet-provider-container">
              <div class="col-sm-12 col-md-6">
                <b-card class="wallet-selection-card text-center mb-3" @click="selectWallet('ledger')">
                  <h5>Ledger</h5>
                  <img src="../assets/ledger_logo.svg">
                  <small>
                    Connect & sign via your <br>
                    hardware wallet                      
                  </small>
                </b-card>
              </div>
              <div class="col-sm-12 col-md-6">
                <b-card class="wallet-selection-card text-center" @click="selectWallet('metamask')">
                  <h5>Metamask</h5>
                  <img src="../assets/metamask_logo.png">
                  <small>
                    Connect & sign via your browser <br>
                    or extension                      
                  </small>
                </b-card>                  
              </div>                
            </div>  
          </b-card>


          <ChainSelector style="width: 250px; margin: 24px auto;" class="connection-status"
                      v-if="!isProduction"
                      :allowedUrls="chainUrls"
                      :serverUrl="currentChain"
                      @urlClicked="onUserInputUrl"
                      @urlInput="onUserInputUrl"/>


        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
// import ApiClient from '../services/faucet-api'
import { Component, Watch } from 'vue-property-decorator'
import FaucetHeader from '../components/FaucetHeader'
import FaucetFooter from '../components/FaucetFooter'
import ChainSelector from '../components/ChainSelector'
import SeedPhraseModal from '../components/modals/SeedPhraseModal'
import ConfirmSeedModal from '../components/modals/ConfirmSeedModal'
import RestoreAccountModal from '../components/modals/RestoreAccountModal'
import HardwareWalletModal from '../components/modals/HardwareWalletModal'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import { setInterval } from 'timers';
const bip39 = require('bip39')

const DPOSStore = createNamespacedHelpers('DPOS')
const DappChainStore = createNamespacedHelpers('DappChain')

@Component({
  components: {
    FaucetHeader,
    FaucetFooter,
    ChainSelector,
    SeedPhraseModal,
    ConfirmSeedModal,
    HardwareWalletModal,
    RestoreAccountModal
  },
  computed: {
    ...mapState([
      'userIsLoggedIn'
    ]),
    ...DappChainStore.mapState([
      'chainUrls'
    ]),    
    ...DPOSStore.mapState([
      'isLoggedIn',
      'walletType',
      'mappingSuccess'
    ]),
    ...mapGetters([
      'getPrivateKey'
    ]),
    ...DappChainStore.mapGetters([
      'currentChain',
    ])
  },
  methods: {    
    ...mapActions(['signOut', 'setPrivateKey']),
    ...DPOSStore.mapActions(['storePrivateKeyFromSeed','initializeDependencies']),
    ...DPOSStore.mapMutations(['setShowLoadingSpinner','setWalletType']),
    ...DappChainStore.mapActions([
      'addChainUrl'
    ]),    
    ...mapMutations(['setUserIsLoggedIn']),
    ...DappChainStore.mapMutations([
      'setMappingError',
      'setMappingStatus'
    ]) 
  }
})
export default class FirstPage extends Vue {
  seedPhrases = []
  activeTab = 0
  currentStatus = this.STATUS.NONE
  showTabSpinner = false
  isProduction = window.location.hostname === "dashboard.dappchains.com"

  async selectWallet(wallet) {
    if(wallet === "ledger") {
      this.setWalletType("ledger")
      this.setUserIsLoggedIn(true)
     this.$refs.hardwareWalletConfigRef.show() 
    } else if(wallet === "metamask") {
      this.setWalletType("metamask")
      this.setUserIsLoggedIn(true)
      this.$root.$emit("login") 
    } else {
      return
    }
  }

  async openLoginModal() {
    this.$root.$emit('bv::show::modal', 'login-account-modal')
  }

  signOutHandler() {
    this.signOut()
    this.$router.push('/')
    this.setMappingError(null)
    this.setMappingStatus(null)
  }

  async onLoginAccount() {
    if (this.currentStatus === this.STATUS.CREATE_ACCOUNT) {
      this.openCreateAccountModal()
    } else if (this.currentStatus === this.STATUS.RESTORE_ACCOUNT) {
      this.openRestoreAccountModal()
    }
  }

  openCreateAccountModal() {
    this.currentStatus = this.STATUS.CREATE_ACCOUNT
    if (this.userIsLoggedIn) {
      this.$refs.seedPhraseRef.show()
    } else {
      this.openLoginModal()
    }
  }

  onGenerateSeeds(seeds) {
    this.seedPhrases = seeds
    this.$refs.confirmSeedRef.show(seeds)
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

  async onConfirmSeeds() {
    this.currentStatus = this.STATUS.NONE
    const mnemonic = this.seedPhrases.join(' ')
    const seed = bip39.mnemonicToSeed(mnemonic)
    await this.storePrivateKeyFromSeed({
      seed
    })
    this.setUserIsLoggedIn(true)
    this.switchTab()
  }

  newUser() {
    this.$refs.seedPhraseRef.show()
  }

  returningUser() {
    this.$refs.restoreAccountModal.show()
  }

  openRestoreAccountModal() {
    this.currentStatus = this.STATUS.RESTORE_ACCOUNT
    if (this.userIsLoggedIn) {
      this.$refs.restoreAccountModal.show()
    } else {
      this.openLoginModal()
    }
  }

  async onRestoreAccount(mnemonic) {
    this.currentStatus = this.STATUS.NONE
    const seed = bip39.mnemonicToSeed(mnemonic)
    await this.storePrivateKeyFromSeed({
      seed
    })
    this.setUserIsLoggedIn(true)
    this.switchTab() 
  }

  switchTab() {
    this.showTabSpinner = true

    setTimeout(() => {
      if ((window.web3 && window.web3.currentProvider.isTrust) || !!window.imToken) {
        this.setWalletType("metamask")
        this.$root.$emit("login") 
      }
      
      this.activeTab === 0 ? this.activeTab = 1 : this.activeTab = 0
      this.showTabSpinner = false
    }, 1000)
  }

  get STATUS() {
    return {
      NONE: 'NONE',
      CREATE_ACCOUNT: 'CREATE_ACCOUNT',
      RESTORE_ACCOUNT: 'RESTORE_ACCOUNT'
    }
  }

  async onWalletConfig() {
    this.setWalletType("ledger")
  }

}
</script>
<style lang="scss" scoped>
  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: 2px solid #f2f1f3;
  }
  .banner-container .col {
    padding: 0 36px;
  }

  .button-inner-container {
    width: 250px;
  }

  .rmv-padding {
    padding: 0 !important;
  }

  #login-tab {
    .actions {
      display: flex;
      justify-content: center;
      button {
        width: 250px;
        margin:16px;
      }
    }
  }

  @media (max-width: 767px) { 
    #login-tab {
      .actions {
      display: flex;
      flex-direction: column;
        button {
          width:100%;
          margin:8px 0;
        }
      }
    }

  }


</style>


<style lang="scss">



.header {
  .navbar {
    padding: 0;
    width: 100%;
    .navbar-brand {
      display: block;
      padding: 0;
      img {
        height: 56px;
      }
    }
  }
}

.nav-pills .nav-link.active span {
  display: inline-block;
  color: #ffffff;
  margin-right: 6px;
}

.wallet-selection-card:hover {
  border: 1px solid #53e63c;
}

.tab-title {
  display: inline-block;
  margin-right: 6px;
}

.loomy-graphic {
  display: block;
  max-height: 200px;
  margin: 0 auto;
}

.faucet {
  main {
    min-height: 620px;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  color: gray;
  h3,h1 {
    color: gray;
  }
  .bottom-border {
    border-bottom: 2px solid lightgray;
  }
  .top-border {
    border-top: 2px solid lightgray;
  }
  .no-top-border {
    border-top: 0;
  }
  .no-bottom-border {
    border-bottom: 0;
  }  
  .button {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    background-color: transparent;
    padding: 20px;
  }
}

.wallet-provider-container {
  .wallet-selection-card {
    position: relative;
    img {
      width: 72px;
      height: auto;
      margin-bottom: 12px;
    }
    small {
      display: block;
    }
    span.qa {        
      display: inline-block;
      line-height: 20px;        
      right: 12px;
      bottom: 12px;
      position: absolute;
      font-weight: bold;
      width: 20px;
      height: 20px;
      color: white;
      background-color: grey;
      border-radius: 50%;
    }
  }
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
