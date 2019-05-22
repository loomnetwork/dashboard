<template>
<div> 
  <b-modal id="confirm-seed-modal" ref="modalRef" title="Hardware wallet" hide-footer centered no-close-on-backdrop>
    <b-container fluid>
      <b-row class="my-1 align-items-center min-height">
        <loading-spinner v-if="showLoadingSpinner" :showBackdrop="true"></loading-spinner>
        <div v-if="componentLoaded" class="dropdown-container mb-4">
          <b-form>
            <b-form-select
              class="mb-2 mr-sm-2 mb-sm-0"
              :value="null"
              v-model="selectedPath"
              :options="filteredPaths"
              id="inlineFormCustomSelectPref">
              <option slot="first" :value="null">Select a path</option>
            </b-form-select>
          </b-form>
        </div>

        <b-card no-body class="wallet-config-container">
          <b-form-group v-if="accounts">
            <div class="table-container address-table">
              <table class="table b-table table-striped table-hover">
                <tbody>
                  <b-form-radio-group v-model="selectedAddress"
                                      stacked
                                      name="radiosStacked">
                    <tr v-for="(account, index) in accounts" :key="index" @click="selectAccount(account)">
                      <td>{{account.index}}</td>
                      <td>{{formatAddress(account.account)}}</td>
                      <td>{{formatBalance(account.balance)}}</td>
                      <td><b-form-radio :value="index"></b-form-radio></td>
                    </tr>
                  </b-form-radio-group>
                  <div v-if="accounts.length > 0" class="pagination-container">
                    <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" size="md" />
                  </div>
                </tbody>
              </table>
            </div>
          </b-form-group>
        </b-card>

      </b-row>
      <b-row class="my-1 justify-content-between pt-4">
        <span v-if="errorMsg" class="text-error  mt-2" variant="error">{{errorMsg}}</span>
        <b-button class="btn proceed-btn" :disabled="selectedAddress < 0 || disableProgressBtn" variant="primary" @click="okHandler">Proceed</b-button>
      </b-row>
    </b-container>
  </b-modal>
  <b-modal id="unlock-ledger-modal"  title="Unlock Hardware wallet" hide-footer centered no-close-on-backdrop> 
    {{ $t('components.modals.hardware_wallet_modal.enter_pin_code') }}
  </b-modal>
</div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import LoadingSpinner from '../LoadingSpinner'
import DropdownTemplate from './DropdownTemplate'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import LedgerWallet from "@/services/ledger/ledgerWallet"
import { pathsArr as hdPaths } from "@/services/ledger/paths"
var HookedWalletProvider = require('web3-provider-engine/subproviders/hooked-wallet');

import { formatToCrypto } from '../../utils'
import { initWeb3Hardware, initWeb3SelectedWallet, initWeb3SelectedWalletBeta } from '../../services/initWeb3'
import { setTimeout } from 'timers';
import { throws } from 'assert';

const dposStore = createNamespacedHelpers('DPOS')
const dappChainStore = createNamespacedHelpers('DappChain')

@Component({
  components: {
    LoadingSpinner
  },
  methods: {
    ...dposStore.mapMutations(['setCurrentMetamaskAddress', 
                              'setConnectedToMetamask',
                              'setWeb3',
                              'setSelectedAccount', 
                              'setShowLoadingSpinner', 
                              'setStatus', 
                              'setSelectedLedgerPath']),
    ...mapMutations(['setErrorMsg',
                    'setSuccessMsg',
                    'setUserIsLoggedIn'
                    ]),
    ...dposStore.mapActions(['checkMappingAccountStatus','initializeDependencies']),
    ...dappChainStore.mapActions([
      'ensureIdentityMappingExists',
      'init',
      'registerWeb3',
      'ethCoin'
    ]),
    },
  computed: {
    ...dappChainStore.mapState([
      'mappingStatus',
      'mappingError'
    ]),
    ...dposStore.mapState([
      'status', 
      'mappingSuccess',
      'selectedAccount'
    ]),
  }
})


export default class HardwareWalletModal extends Vue {

  // Pagination
  rows = 100
  perPage = 10
  currentPage = 1

  hdWallet = undefined
  maxAddresses = 100
  errorMsg = null
  accounts = []

  showLoadingSpinner = false
  path = ""
  derivationPath = ""
  paths = []
  filteredPaths = []
  addresses = []
  selectedPath = null
  selectedAddress = -1
  dropdownTemplate = DropdownTemplate
  componentLoaded = false
  disableProgressBtn = false

  web3js = undefined


  @Watch('currentPage')
    onCurrentPageChange(newValue, oldValue) {      
    if(newValue) {
      this.updateAddresses()
    }
  }

  @Watch('selectedPath')
    onPathChange(newValue, oldValue) {      
    if(newValue) {
      this.updateAddresses()
      // this.selectPath(newValue)
    }
  }

  async updateAddresses() {
    this.showLoadingSpinner = true
    this.derivationPath = this.selectedPath.replace('m/','')
    let offset = (this.currentPage - 1) * this.perPage

    let results = await initWeb3SelectedWalletBeta(this.calculatePath(offset))
    this.accounts = results.map((account, index) => {
      let offsetIndex = offset + index
      return {
        account: account,
        balance: 'loading',
        index: offsetIndex,
        path: this.calculatePath(offsetIndex)
        }
    })

    if(this.accounts.length > 0) this.getBalances()
    this.showLoadingSpinner = false
  }

  calculatePath(offset) {
    if(this.derivationPath === "44'/60'") {
      // Ethereum addresses (Ledger live)
      return `44'/60'/${offset}'/0/0`
    }
    else if(this.derivationPath === "44'/60'/0'") {
      // Ethereum addresses (legacy)
      return `${this.derivationPath}/${offset}`
    }
    
  }

  onPaginationChange() {
    console.log("the current page", this.currentPage)
  }

  async okHandler() {
    this.disableProgressBtn = true
    let selectedAddress = this.selectedAccount.account
    this.setCurrentMetamaskAddress(selectedAddress)

    this.setSelectedLedgerPath(this.path)
    this.web3js = await initWeb3SelectedWallet(this.path)

    // assert web3 address is the actual user selected address. Until we fully test/trust this thing...
    const web3account = (await this.web3js.eth.getAccounts())[0]
    console.assert(web3account === selectedAddress, 
      `Expected web3 to be initialized with ${selectedAddress} but got ${web3account}`)
    this.setWeb3(this.web3js)
    this.registerWeb3({web3: this.web3js})
    this.setConnectedToMetamask(true)
    this.$refs.modalRef.hide()
    await this.checkMapping(selectedAddress)
    this.disableProgressBtn = false

    try {
      await this.initializeDependencies()
      this.setUserIsLoggedIn(true)
      if(this.mappingSuccess) {
        this.$emit('ok');
        this.$router.push({
          name: 'account'
        })
      }      
    } catch(err) {
      this.setErrorMsg({msg: "Error initializing dependencies. Please try again.", forever: false, report:true, cause:err})
      return
    }

  }

  async checkMapping(selectedAddress) {
    this.setShowLoadingSpinner(true)
    await this.init()
    await this.ensureIdentityMappingExists({currentAddress: selectedAddress})
    this.setShowLoadingSpinner(false)
    await this.checkMappingAccountStatus()
  }

  mounted() {
    this.paths = hdPaths.paths
    this.filteredPaths = hdPaths.paths.map((item) => { return { value: item.path, text: item.label } })
  }

  getLabel(item) {
    if(!item) return
    return item.label
  }

  updateItems(query) {
    if(query) {
      this.filteredPaths = this.paths.filter((item) => {
        return item.label.toLowerCase().includes(query.toLowerCase())
      })
    } else {
      this.filteredPaths = this.paths
    }
  }

  async selectItem(item) {
    if(!item) return
    const {path} = item
    await this.selectPath(path)
  }

  async selectPath(path) {
    this.accounts = []
    this.selectedAddress = -1

    if(typeof this.hdWallet ===  "undefined") {
      try {
        this.showLoadingSpinner = true
        this.hdWallet = await LedgerWallet()
      } catch (err) {
        this.setErrorMsg({msg: "Can't connect to your wallet. Please try again.", forever: false, report:true, cause:err})
        console.log("Error in LedgerWallet:", err);
        this.showLoadingSpinner = false
        return
      }
    }

    try {
      this.showLoadingSpinner = true
      await this.hdWallet.init(path)
    } catch (err) {
      this.setErrorMsg({msg: "Can't connect to your wallet. Please try again.", forever: false, report:true, cause:err})
      console.log("Error when trying to init hd wallet:", err);
      this.showLoadingSpinner = false
      return
    }

    let i = 0
    let accountsTemp = []
    while (i <= this.maxAddresses) {
      let account = this.hdWallet.getAccount(i)
      accountsTemp.push(account)
      i++
    }

    Promise.all(accountsTemp).then((values) => {

      this.accounts = values.map((account) => {
        return {
          account: account,
          balance: 'loading'
         }
      })

      if(this.accounts.length > 0) return this.getBalances() 

    }).catch((err) => {
      this.setErrorMsg({msg: "Error loading your wallet accounts. Please try again.", forever: false, report:true, cause:err})
      console.log("Error when trying to get accounts:", err);
      this.showLoadingSpinner = false
    }).then(async () => {
      this.showLoadingSpinner = false
    })

  }

  selectAccount(account) {
    this.setSelectedAccount(account)
    this.path = account.path
  }

  loadAddresses(path) {
    console.log("Loading addresses at path: ", path)
  }


  async setWeb3Instance() {
    if(typeof this.web3js === "undefined") {
      let web3js = await initWeb3Hardware() //initLedgerProvider()
      window.ledgerweb3 = web3js
      this.web3js = web3js
      this.setWeb3(web3js)
    }
  }

  async getBalances() {
    this.accounts.forEach(item => {
      this.web3js.eth
        .getBalance(item.account)
        .then(balance => {
          item.balance = balance
        })
    })
  }

  formatBalance(amount) {
    return formatToCrypto(amount)
  }

  formatAddress(address) {
    let cap = 10
    return address.slice(0, cap) + "..." + address.slice(-cap, address.length)
  }

  async show(myWeb3) {
    this.componentLoaded = true
    await this.setWeb3Instance()
    try {
      this.showLoadingSpinner = true
      this.hdWallet = await LedgerWallet()
    } catch(err) {
      this.$root.$emit("bv::show::modal", "unlock-ledger-modal")
      this.showLoadingSpinner = false
      return
    }
    this.$refs.modalRef.show()
    this.showLoadingSpinner = false
  }

}
</script>
<style lang="scss">
label {
  color: gray;
}
#confirm-seed-modal .modal-dialog {
  width: 500px;
  max-width: 500px;
  .modal-header {
    margin-left: 10px;
    margin-right: 10px;
    padding-left: 5px;
    padding-right: 5px;
    h5 {
      color: gray;
    }
  }
  .modal-body {
    .col-sm-3, .col-sm-9 {
      padding: 0;
    }
    .text-error {
      color: red;
    }
    .btn {
      width: 150px;
    }
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  .pagination {
    margin: 0;
  }
}

.address-table {
  max-height: 280px;
  overflow-y: scroll;
}
.wallet-config-container {
   width: 100%;
   .card-body {
    padding: 0px;
    max-height: 250px;
    overflow: scroll;
   }
  .custom-control-label::before {
    position: relative;
  }
  table {
    margin-bottom: 0px;
    td {
      white-space: no-wrap;
      padding: 0.5rem;
    }
    tr {
      width: 100%;
      display: inline-table;
    }
  }
  .form-group {
    margin-bottom: 0px;
  }
}

.proceed-btn {
  margin-left: auto;
}

.dropdown-container {
  width: 100%;
  input {
    width: 100%;
    border: 2px solid #f2f1f3;
    padding: 4px 12px;
  }
}


</style>
