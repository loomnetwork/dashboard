<!-- PlasmaChain Delegators -->
<template>
  <div class="faucet">
    <div class="faucet-content">
      <main>
        <!-- <login-account-modal ref="loginAccountRef" @ok="onLoginAccount" @onLogin="onLoginAccount"/> -->
        <!-- <create-account-modal ref="createAccountRef" @ok="onCreateAcount"></create-account-modal> -->
        <seed-phrase-modal ref="seedPhraseRef" @ok="onGenerateSeeds"/>
        <confirm-seed-modal ref="confirmSeedRef" @ok="onConfirmSeeds"/>
        <restore-account-modal ref="restoreAccountModal" @ok="onRestoreAccount"/>

        <div class="container mb-5 column">
          <div class="row my-3 p-3 d-flex justify-content-center mb-auto mt-auto">
            <div class="col col-lg-6 d-flex flex-column justify-content-center ">
              <img src="../assets/loomy-player-one.png" class="loomy-graphic">
              <div class="d-flex flex-column justify-content-center align-items-center flex-wrap">
                <!-- <b-button class="top-border bottom-border button" v-if="userIsLoggedIn" @click="signOutHandler"><p class="mb-0 color-grey"><b>Sign out</b></p><p class="mb-0 color-grey">Sign out account</p></b-button>
                <b-button class="top-border bottom-border button" v-else @click="openLoginModal"><p class="mb-0 color-grey"><b>Login</b></p><p class="mb-0 color-grey">Sign in with existing account</p></b-button>
                <b-button class="no-top-border bottom-border button" @click="openCreateAccountModal"><p class="mb-0 color-grey"><b>Create Account</b></p><p class="mb-0 color-grey">Setup new account from scratch</p></b-button>
                <b-button class="no-top-border bottom-border button" @click="openRestoreAccountModal"><p class="mb-0 color-grey"><b>Restore Account</b></p><p class="mb-0 color-grey">Use seed phrase to retrieve existing account</p></b-button> -->
                <b-button class="mb-3" style="width: 250px" variant="primary" @click="newUser">New User</b-button>
                <b-button class="mb-3" variant="primary" style="width: 250px" @click="returningUser">Returning User</b-button>

                <ChainSelector style="width: 250px" class="connection-status"
                  :allowedUrls="chainUrls"
                  :serverUrl="currentChain"
                  @urlClicked="onUserInputUrl"
                  @urlInput="onUserInputUrl"/>


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
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
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
    RestoreAccountModal
  },
  computed: {
    ...mapState([
      'userIsLoggedin'
    ]),
    ...DappChainStore.mapState([
      'chainUrls',
    ]),    
    ...DPOSStore.mapState([
      'isLoggedIn'
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
    ...DPOSStore.mapActions(['storePrivateKeyFromSeed']),
    ...DappChainStore.mapActions([
      'addChainUrl',
    ]),    
    ...mapMutations(['setUserIsLoggedIn'])
  }
})
export default class FirstPage extends Vue {
  seedPhrases = []

  currentStatus = this.STATUS.NONE

  async openLoginModal() {
    this.$root.$emit('bv::show::modal', 'login-account-modal')
  }

  signOutHandler() {
    this.signOut()
    this.$router.push('/')
  }

  async onLoginAccount() {
    if (this.currentStatus === this.STATUS.CREATE_ACCOUNT) {
      this.openCreateAccountModal()
    } else if (this.currentStatus === this.STATUS.RESTORE_ACCOUNT) {
      this.openRestoreAccountModal()
    }
  }

  async gotoAccount() {
    this.$root.$emit('login')
    if(this.isLoggedIn) {
      this.$router.push({
        name: 'account'
      })
      return true
    }
    return false
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
    await this.gotoAccount()
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
    await this.gotoAccount()
  }

  get STATUS() {
    return {
      NONE: 'NONE',
      CREATE_ACCOUNT: 'CREATE_ACCOUNT',
      RESTORE_ACCOUNT: 'RESTORE_ACCOUNT'
    }
  }

}</script>

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
      }
    }
  }
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
  .loomy-graphic {
    display: inline-block;
    margin: 0 auto;
    margin-bottom: 32px;
    width: 100%;
    max-width: 360px;
    height: auto;
  }
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
