<!-- PlasmaChain Delegators -->
<template>
  <div class="">
    <div class="faucet-content pt-5">
      <main>
        <!-- <login-account-modal ref="loginAccountRef" @ok="onLoginAccount" @onLogin="onLoginAccount"/> -->
        <!-- <create-account-modal ref="createAccountRef" @ok="onCreateAcount"></create-account-modal> -->
        <seed-phrase-modal ref="seedPhraseRef" @ok="onGenerateSeeds"/>
        <confirm-seed-modal ref="confirmSeedRef" @ok="onConfirmSeeds"/>
        <restore-account-modal ref="restoreAccountModal" @ok="onRestoreAccount"/>
        <hardware-wallet-modal ref="hardwareWalletConfigRef" @ok="onWalletConfig"/>
        <div class="container-fluid mb-5 rmv-padding">
          <div class="row d-flex justify-content-center mb-auto">
            <div class="col">
              <div>
                <b-card no-body>
                  <b-tabs card v-model="activeTab">
                    <b-tab>
                      <template slot="title">
                        <span class="tab-title">1. Login to PlasmaChain</span>
                        <b-spinner v-if="showTabSpinner" type="border" small />
                        <fa v-if="userIsLoggedIn && !showTabSpinner" icon="check" class="tab-icon"/>
                      </template>
                        <div class="row">
                          <img src="../assets/loomy-player-one.png" class="loomy-graphic">
                        </div>
                      <div class="row pt-4 pb-4">
                        <div class="col text-center">
                          <b-button class="mb-3" style="width: 250px" variant="primary" @click="newUser">{{ $t('views.first_page.new_user') }}</b-button>
                        </div>
                        <div class="col">
                          <div class="button-inner-container">
                            <b-button class="mb-3" variant="primary" style="width: 250px" @click="returningUser">{{ $t('views.first_page.returning_user') }}</b-button>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                          <b-button v-b-toggle.collapse1 variant="warning" v-if="!isProduction">Diagnostic Options</b-button>
                          <b-collapse id="collapse1" class="mt-2">
                            <b-card>
                              <ChainSelector style="width: 250px; margin: 0 auto;" class="connection-status"
                                v-if="!isProduction"
                                :allowedUrls="chainUrls"
                                :serverUrl="currentChain"
                                @urlClicked="onUserInputUrl"
                                @urlInput="onUserInputUrl"/>
                
                            </b-card>
                          </b-collapse>
                         
                       </div>                      
                    </b-tab>
                    <b-tab :disabled="!userIsLoggedIn">
                      <template slot="title">
                        <span class="tab-title">2. Login to Ethereum</span>
                      </template>                      
                      <div class="row wallet-provider-container">
                        <div class="col">
                          <b-card class="wallet-selection-card text-center" @click="selectWallet('ledger')">
                            <img src="../assets/ledger_logo.svg">
                            <p>
                              Connect & sign via your <br>
                              hardware wallet                      
                            </p>
                            <span id="ledgerInfo" class="qa">? </span>
                            <b-tooltip target="ledgerInfo" placement="bottom" title="Click here to connect with your Ledger hardware wallet"></b-tooltip>
                          </b-card>
                        </div>
                        <div class="col">
                          <b-card class="wallet-selection-card text-center" @click="selectWallet('metamask')">
                            <img src="../assets/metamask_logo.png">
                            <p>
                              Connect & sign via your browser <br>
                              or extension                      
                            </p>
                            <span id="metamaskInfo" class="qa">? </span>
                            <b-tooltip target="metamaskInfo" placement="bottom" title="Click here to connect with your Metamask wallet"></b-tooltip>
                          </b-card>                  
                        </div>                
                      </div>                      
                    </b-tab>
                  </b-tabs>
                </b-card>
              </div>





            </div>
          </div>

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
      
      try {
        this.$refs.hardwareWalletConfigRef.show()
        this.setWalletType("ledger")
      } catch(err) {
        this.setShowLoadingSpinner(false)
        console.log(err)
      }
    } else if(wallet === "metamask") {
      this.setWalletType("metamask")
      if(window.ethereum) {
        window.ethereum.on('accountsChanged', async (accounts) => {
          if(this.userIsLoggedIn) this.ensureIdentityMappingExists({currentAddress: accounts[0]})
          this.setCurrentMetamaskAddress(accounts[0])
        })
      }
      await this.initializeDependencies()
    } else {
      return
    }
    this.$root.$emit("login") 
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
    await this.initializeDependencies()
  }

}</script>


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
</style>


<style lang="scss">
@import url('https://use.typekit.net/nbq4wog.css');

$theme-colors: (
  //primary: #007bff,
  primary: #02819b,
  secondary: #4bc0c8,
  success: #5cb85c,
  info: #5bc0de,
  warning: #f0ad4e,
  danger: #d9534f,
  light: #f0f5fd,
  dark: #122a38
);

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
  .col {
    position: relative;
    img {
      width: 96px;
      height: auto;
      margin-bottom: 12px;
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
