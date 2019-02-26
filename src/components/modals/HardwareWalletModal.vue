<template>
  <b-modal id="confirm-seed-modal" ref="modalRef" title="Hardware wallet" hide-footer centered no-close-on-backdrop>
    <b-container fluid>
      <b-row class="my-1 align-items-center min-height">
        <loading-spinner v-if="showLoadingSpinner" :showBackdrop="true"></loading-spinner>

        <div v-if="componentLoaded" class="dropdown-container mb-4">
          <v-autocomplete :items="filteredPaths"
                         v-model="selectedPath"
                         :get-label="getLabel"
                         :component-item="dropdownTemplate"
                         @item-selected="selectItem"
                         @update-items="updateItems">
          </v-autocomplete>
        </div>

        <b-card no-body class="wallet-config-container">
          <b-form-group v-if="accounts">
            <div class="table-container">
              <table class="table b-table table-striped table-hover">
                <tbody>
                  <b-form-radio-group v-model="selectedAddress"
                                      stacked
                                      name="radiosStacked">
                    <tr v-for="(account, index) in accounts" :key="index" @click="selectAccount(account, index)">
                      <td>{{account.index}}</td>
                      <td>{{formatAddress(account.account.getChecksumAddressString())}}</td>
                      <td>{{formatBalance(account.balance)}}</td>
                      <td><b-form-radio :value="index"></b-form-radio></td>
                    </tr>
                  </b-form-radio-group>
                </tbody>
              </table>   
            </div>
          </b-form-group>          
        </b-card>  
 
      </b-row>
      <b-row class="my-1 justify-content-between pt-4">
        <span v-if="errorMsg" class="text-error  mt-2" variant="error">{{errorMsg}}</span>
        <b-button class="btn proceed-btn" variant="primary" @click="okHandler">Proceed</b-button>
      </b-row>
    </b-container>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import LoadingSpinner from '../LoadingSpinner'
import DropdownTemplate from './DropdownTemplate'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import LedgerWallet from "@/services/ledger/ledgerWallet"
import { pathsArr as hdPaths } from "@/services/ledger/paths"
var HookedWalletProvider = require('web3-provider-engine/subproviders/hooked-wallet');

import { formatToCrypto } from '../../utils'
// import { initLedgerProvider } from '../../services/initWeb3'
import { initWeb3Hardware, initWeb3SelectedWallet } from '../../services/initWeb3'
import { setTimeout } from 'timers';

const HDWalletStore = createNamespacedHelpers('HDWallet')
const dposStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    LoadingSpinner
  },
  methods: {
    ...dposStore.mapMutations(['setCurrentMetamaskAddress', 'setWeb3','setSelectedAccount']),
    ...mapMutations(['setErrorMsg',
                    'setSuccessMsg'
                    ])
  },
  computed: {
    ...HDWalletStore.mapState(['maxAddresses'])
  }
})

export default class HardwareWalletModal extends Vue {

  hdWallet = undefined

  errorMsg = null
  accounts = []

  showLoadingSpinner = false
  paths = []
  filteredPaths = []
  addresses = []
  selectedPath = hdPaths.paths[0]
  selectedAddress = 0
  dropdownTemplate = DropdownTemplate
  componentLoaded = false

  web3js = undefined

  async okHandler() {
    let selectedAddress = this.accounts[this.selectedAddress].account.getChecksumAddressString()
    console.log('selected address', selectedAddress)
    this.setCurrentMetamaskAddress(selectedAddress)
    this.web3js.eth.defaultAccount = selectedAddress

    this.web3js = await initWeb3SelectedWallet((res) => {
      console.log('calling get accounts')
      res(null, [selectedAddress])
    })
    
    this.setWeb3(this.web3js)
    
    debugger
    this.$emit('ok');

    // this.web3js = web3js.currentProvider.stop() // MetaMask/provider-engine#stop()

    this.$refs.modalRef.hide()     
  }

  mounted() {
    this.paths = hdPaths.paths
    this.filteredPaths = hdPaths.paths
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

    if(typeof this.hdWallet ===  "undefined") this.hdWallet = await LedgerWallet()

    try {
      await this.hdWallet.init(path)
    } catch(err) {
      this.$log("err", err)
      return
    }
    
    let i = 0
    let accountsTemp = []
    while (i < this.maxAddresses) {
      try {
        let account = await this.hdWallet.getAccount(i)
        accountsTemp.push({
          index: i,
          account: account,
          balance: 'loading'
        })
        i++ 
      } catch(err) {
        this.$log("err", err)
        this.setErrorMsg({msg: "Please make sure your hardware wallet is connected", forever: false})
        return
      }
    }
    this.accounts = accountsTemp
    if(this.accounts.length > 0) await this.getBalances()

  }

  selectAccount(account, index) {
    this.setSelectedAccount(account)
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
    this.accounts.forEach(account => {
      this.web3js.eth
        .getBalance(account.account.getChecksumAddressString())
        .then(balance => {
          account.balance = balance
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
    this.showLoadingSpinner = true
    try {
      this.hdWallet = await LedgerWallet()
    } catch(err) {
      this.$log("err", err)
      this.setErrorMsg({msg: "Please make sure your hardware wallet is connected", forever: false})
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
  .v-autocomplete {
    width: 100%;
    input {
      width: 100%;
      border: 2px solid #f2f1f3;
      padding: 4px 12px;
    }
  }

  .v-autocomplete-list {
    width: 100%;
    max-height: 240px;
    overflow-y: auto;
    z-index: 999;
    background-color: #ffffff;
    border: 2px solid #f2f1f3;
    .v-autocomplete-list-item {
      cursor: pointer;
      padding: 6px 12px;
      border-bottom: 2px solid #f2f1f3;
      &:last-child {
        border-bottom: none;
      }
      &:hover {
        background-color: #eeeeee;
      }
    }
  }
}


</style>