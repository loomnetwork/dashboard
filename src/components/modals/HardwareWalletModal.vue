<template>
  <b-modal
    id="confirm-seed-modal"
    v-model="visible"
    title="Hardware wallet"
    hide-footer
    centered
    no-close-on-backdrop
  >
    <b-form style="display: flex; flex-direction: column;">
      <b-form-select class="mb-2" :value="null" :options="paths" v-model="selectedPath">
        <option slot="first" :value="null">Select a path</option>
      </b-form-select>
      <div v-if="loadingAccounts">
        <b-spinner label="Loading accoumt"/>Loading accounts. Please wait
      </div>
      <div v-else-if="loading">
        <b-spinner label="Loading accoumt"/>Loading accounts. Please wait
      </div>
      {{accounts}}
      <b-list-group class="account-list">
        <b-list-group-item
          v-for="(entry) in accounts"
          :key="entry.account"
          :active="entry.account === account.account"
          @click="account = entry"
        >
          <address>{{formatAddress(entry.account)}}</address>
          <div class="balance">{{entry.balance}}</div>
        </b-list-group-item>
      </b-list-group>
      <!--
      <b-form-group v-if="accounts">
        <table class="table b-table table-striped table-hover">
          <tbody>
            <b-form-radio-group v-model="selectedAddress" stacked name="radiosStacked">
              <tr v-for="(entry, index) in accounts" :key="index" @click="account = entry">
                <td>{{entry.index}}</td>
                <td>{{formatAddress(entry.account)}}</td>
                <td>{{formatBalance(entry.balance)}}</td>
                <td>
                  <b-form-radio :value="index"></b-form-radio>
                </td>
              </tr>
            </b-form-radio-group>
            <div v-if="accounts.length > 0" class="pagination-container">
              <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" size="md"/>
            </div>
          </tbody>
        </table>
      </b-form-group>
      -->
      <b-row class="my-1 justify-content-between pt-4">
        <span v-if="errorMsg" class="text-error mt-2" variant="error">{{errorMsg}}</span>
      </b-row>
    </b-form>
    <footer slot="modal-footer" class="w-100">
      <b-button
        class="btn proceed-btn"
        :disabled="account === null"
        variant="primary"
        @click="connect(account)"
      >Proceed</b-button>
    </footer>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import LoadingSpinner from "../LoadingSpinner.vue"
import DropdownTemplate from "./DropdownTemplate.vue"
import { createWallet, CustomLedgerWallet } from "@/services/ledger/ledgerWallet"
import { pathsArr as hdPaths } from "@/services/ledger/paths"

// @ts-ignore
// const HookedWalletProvider = require("web3-provider-engine/subproviders/hooked-wallet")
import HookedWalletProvider from "web3-provider-engine/subproviders/hooked-wallet"
import { formatToCrypto } from "@/utils"
import { initWeb3Hardware, initWeb3SelectedWallet, initWeb3SelectedWalletBeta } from "@/services/initWeb3"
import { CommonTypedStore } from "@/store/common"
import { DPOSTypedStore } from "@/store/dpos-old"
import { DashboardState } from "@/types"
import Web3 from "web3"
import { ethereumModule } from "@/store/ethereum"
import { feedbackModule as feedback } from "@/feedback/store"

interface LedgerAccount {
  address: string
  balance: any
  path: string
}

@Component({
  components: {
    LoadingSpinner,
  },
})
export default class HardwareWalletModal extends Vue {

  // Pagination
  rows = 100
  perPage = 10
  currentPage = 1

  hdWallet: CustomLedgerWallet | null = null
  maxAddresses = 100
  errorMsg: any = null
  accounts: any[] = []
  loadingAccounts = false
  loading = false
  path = ""
  account: LedgerAccount | null = null
  derivationPath = ""
  paths = hdPaths.paths.map((item) => ({ value: item.path, text: item.label }))
  selectedPath: string = ""
  selectedAddress = -1

  web3: Web3 | null = null

  showError = feedback.showError
  showSuccess = feedback.showSuccess

  get visible(): boolean {
    const state = this.state.ethereum
    return state.walletType === "ledger" && state.signer === null
  }

  set visible(val) {
    if (val === false) {
      // disconnect ledger?
      ethereumModule.clearWalletType()
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }

  @Watch("currentPage")
  onCurrentPageChange(newValue, oldValue) {
    if (newValue) {
      this.updateAddresses()
    }
  }

  //@Watch("selectedPath")
  onPathChange(newValue, oldValue) {
    if (newValue) {
      this.updateAddresses()
      this.selectPath(newValue)
    }
  }

  async updateAddresses() {
    this.loadingAccounts = true
    this.derivationPath = this.selectedPath.replace("m/", "")
    const offset = (this.currentPage - 1) * this.perPage

    const results = await initWeb3SelectedWalletBeta(this.calculatePath(offset)!)
    results.map((address, index) => {
      const offsetIndex = offset + index
      return {
        address,
        balance: "loading",
        index: offsetIndex,
        path: this.calculatePath(offsetIndex),
      }
    })

    if (this.accounts.length > 0) this.getBalances()
    this.loading = false
  }

  calculatePath(offset) {
    if (this.derivationPath === "44'/60'") {
      // Ethereum addresses (Ledger live)
      return `44'/60'/${offset}'/0/0`
    } else if (this.derivationPath === "44'/60'/0'") {
      // Ethereum addresses (legacy)
      return `${this.derivationPath}/${offset}`
    }
  }

  async connect(account: LedgerAccount) {
    const selectedAddress = account.address

    // @ts-ignore
    const providerEngine = await initWeb3SelectedWallet(account.path)
    // assert web3 address is the actual user selected address. Until we fully test/trust this thing...
    //const web3account = (await .web3!.eth.getAccounts())[0]
    //console.assert(web3account === selectedAddress,
    //  `Expected web3 to be initialized with ${selectedAddress} but got ${web3account}`)
    // @ts-ignore
    ethereumModule.setProvider(providerEngine)
  }

  @Watch("selectedPath")
  async selectPath(path) {
    this.accounts = []
    this.selectedAddress = -1

    if (this.hdWallet === null) {
      try {
        this.loading = true
        this.hdWallet = await createWallet()
      } catch (err) {
        this.showError(this.$t("messages.select_path_err_tx").toString())
        console.error("Error in LedgerWallet:", err)
        this.loading = false
        return
      }
    }

    this.loadingAccounts = true
    try {
      this.loading = true

      await this.hdWallet.init(path)
    } catch (err) {
      this.showError(this.$t("messages.select_path_err_tx").toString())
      console.log("Error when trying to init hd wallet:", err)
      this.loading = false
      return
    }
    let i = 0
    const accountsTemp: any[] = []
    while (i <= this.maxAddresses) {
      const account: HDKey = await this.hdWallet.getAccount(i)
      console.log("account", account)
      this.accounts.push({
        address: account,
        balance: "loading",
      })
      i++
    }
    this.loadingAccounts = false

    if (this.accounts.length > 0) return this.getBalances()

    // }).catch((err) => {
    //   this.showError(this.$t("messages.load_wallet_err_tx").toString())
    //   console.log("Error when trying to get accounts:", err)
    // }).finally(async () => {
    //   this.loadingAccounts = false
    // })

  }



  // async setWeb3Instance() {
  //   if (typeof this.web3 === "undefined") {
  //     const web3 = await initWeb3Hardware()
  //     // @ts-ignore
  //     this.setWeb3(web3js)
  //   }
  // }

  getBalances() {
    this.accounts.forEach((item) => {
      this.web3.eth
        .getBalance(item.account)
        .then((balance) => {
          item.balance = balance
        })
    })
  }

  formatAddress(address) {
    const cap = 10
    return address.slice(0, cap) + "..." + address.slice(-cap, address.length)
  }

  @Watch("visible")
  async init(visible) {
    if (visible === false) return

    console.log("visible")
    // await this.setWeb3Instance()
    try {
      this.loading = true
      this.hdWallet = await createWallet()
    } catch (err) {
      feedback.showInfo("Please unlock your ledger and go to ethereum app")
      //this.$root.$emit("bv::show::modal", "unlock-ledger-modal")
      this.loading = false
      return
    }
    this.loading = false
  }



}
</script>
<style lang="scss">
.account-list {
  .list-group-item {
    display: flex;
    > address {
      margin: 0;
      font-family: "Courier New", Courier, monospace;
      width: 230px;
    }
    .balance {
      flex: 1;
      text-align: right;
    }
  }
}

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
    .col-sm-3,
    .col-sm-9 {
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
