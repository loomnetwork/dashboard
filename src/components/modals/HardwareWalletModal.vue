<template>
  <b-modal
    id="hd-wallet-modal"
    v-model="visible"
    title="Hardware wallet"
    hide-footer
    centered
    no-close-on-backdrop
  >
    <b-form style="display: flex; flex-direction: column;">
      <b-alert
        show
        variant="warning">
      {{ $t('components.modals.hardware_wallet_modal.this_option_deprecated') }}</b-alert>
      <b-alert
        variant="info"
        :show="ledgerLocked === true"
      >{{ $t('components.modals.hardware_wallet_modal.ledger_locked') }}</b-alert>
      <b-alert :show="!!errorMsg">{{errorMsg}}</b-alert>
      <div v-if="!hdWallet && ledgerLocked === false">
        <b-spinner label="Loading" />{{ $t('components.modals.hardware_wallet_modal.initializing') }}
      </div>
      <b-form-select class="mb-2" :value="null" :options="paths" v-model="selectedPath">
        <option slot="first" :value="null">{{ $t('components.modals.hardware_wallet_modal.select_path') }}</option>
      </b-form-select>

      <b-list-group class="account-list" v-if="selectedPath">
        <b-list-group-item
          v-for="option in accounts"
          :key="option.address"
          :active="option === account"
          @click="account = option"
        >
          <address>{{formatAddress(option.address)}}</address>
          <div class="balance">{{option.balance | tokenAmount}} ETH</div>
        </b-list-group-item>
        <b-list-group-item class="load-more" @click="loadMore" v-if="!loadingAccounts">{{ $t('components.modals.hardware_wallet_modal.load_more') }}</b-list-group-item>
        <b-list-group-item class="loading" v-else>
          <b-spinner label="Loading" />
        </b-list-group-item>
      </b-list-group>

      <footer slot="modal-footer" class="mt-3">
        <b-button
          class="btn proceed-btn"
          :disabled="account === null"
          variant="primary"
          @click="connect(account)"
        >{{ $t('components.modals.hardware_wallet_modal.use_account') }}</b-button>
      </footer>
    </b-form>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { pathsArr as hdPaths } from "@/services/ledger/paths"

import { DashboardState } from "@/types"
import Web3 from "web3"
import { ethereumModule } from "@/store/ethereum"
import { feedbackModule as feedback } from "@/feedback/store"
import TransportU2F from "@ledgerhq/hw-transport-u2f"
import createLedgerSubprovider from "@ledgerhq/web3-subprovider"
import ProviderEngine from "web3-provider-engine"
import FetchSubprovider from "web3-provider-engine/subproviders/fetch"
import { createWallet, CustomLedgerWallet } from "@/services/ledger/ledgerWallet"

import { of, from } from "rxjs"
import { map, tap, flatMap, concatMap } from "rxjs/operators"

interface LedgerAccount {
  address: string
  balance: any
  path: string
}

@Component
export default class HardwareWalletModal extends Vue {
  _transport!: TransportU2F
  // Pagination
  // rows = 100
  // perPage = 10
  // currentPage = 1

  ledgerLocked = false

  hdWallet: CustomLedgerWallet | null = null
  readonly maxAddresses = 100
  errorMsg: any = null
  accounts: any[] = []
  path = ""
  account: LedgerAccount | null = null
  derivationPath = ""
  readonly paths = hdPaths.paths.map((item) => ({ value: item.path, text: item.label }))
  selectedPath: string = ""

  web3: Web3 | null = null
  infura!: Web3
  ledger: any = null

  loading = false
  loadingAccounts: boolean = false

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

  async transport() {
    if (!this._transport) {
      try {
        this._transport = await TransportU2F.create(3000, 10000)
      } catch (e) {
        this.errorMsg = "Unable to connect to Ledger"
        console.error("unable to create TransportU2F")
        console.error(e)
      }
    }
    return this._transport
  }

  calculatePath(path, offset) {
    const derivationPath = path.replace("m/", "")
    if (derivationPath === "44'/60'") {
      // Ethereum addresses (Ledger live)
      return `44'/60'/${offset}'/0/0`
    } else if (derivationPath === "44'/60'/0'") {
      // Ethereum addresses (legacy)
      return `${derivationPath}/${offset}`
    }
    throw new Error("Don't know how to handle path " + path)
  }

  async connect(account: LedgerAccount) {
    const selectedAddress = account.address
    const path = this.calculatePath(this.selectedPath, this.accounts.indexOf(account))
    const networkId = Number(this.state.ethereum.networkId)
    const rpcUrl = this.state.ethereum.endpoint
    const engine = new ProviderEngine()
    const transport = await this.transport()
    const ledger = createLedgerSubprovider(
      () => transport, {
        networkId,
        accountsLength: 1,
        path,
      })

    ledger.signMessage = ledger.signPersonalMessage
    engine.addProvider(ledger)
    engine.addProvider(
      // new RpcSubprovider({ rpcUrl }),
      new FetchSubprovider({
        rpcUrl,
      }),
    )
    engine.start()
    // @ts-ignore
    // const web3account = (await .web3!.eth.getAccounts())[0]
    // console.assert(web3account === selectedAddress,
    //  `Expected web3 to be initialized with ${selectedAddress} but got ${web3account}`)

    // @ts-ignore
    ethereumModule.setProvider(engine)
  }

  @Watch("selectedPath")
  onPathChange() {
    this.loadMore()
  }

  @Watch("selectedPath")
  async loadAccounts() {
    this.accounts = []
  }

  async loadMore() {
    const transport = await this.transport()
    const getTransport = () => transport
    const path = this.selectedPath
    const networkId = Number(this.state.ethereum.networkId)
    const accountsLength = 4
    const offset = this.accounts.length
    // stop the loop when selectedPath has chaned or max accounts reached
    if (offset + accountsLength >= 100) {
      return
    }

    // console.log("loading,", path, offset, networkId, accountsLength)
    this.loadingAccounts = true
    const ledger = createLedgerSubprovider(
      getTransport
      , {
        networkId,
        accountsLength,
        path: this.calculatePath(path, offset),
      })
    const t = Date.now()
    // console.log("getAccounts")
    ledger.getAccounts((error, accounts: string[]) => {
      console.log("getAccounts", (Date.now() - t) / 1000)

      if (error) {
        // show error "please unlock your ledger wallet and go to the etherum app"
        console.log(error)
      } else {
        from(accounts)
          .pipe(
            map((address) => ({ address, balance: -1 })),
            concatMap(this.loadBalance),
          ).subscribe(
            (account) => this.accounts.push(account),
            console.error,
            () => this.loadingAccounts = false,
          )
      }
    })
  }

  async loadBalance(account) {
    account.balance = await this.infura.eth.getBalance(account.address)
    return account
  }

  formatAddress(address) {
    const cap = 10
    return address.slice(0, cap) + "..." + address.slice(-cap, address.length)
  }

  @Watch("visible")
  async onToggle(visible) {
    if (visible === false) return

    const endpoint = ethereumModule.state.endpoint
    const web3Provider = /^ws/.test(endpoint) ?
      new Web3.providers.WebsocketProvider(endpoint) :
      new Web3.providers.HttpProvider(endpoint)

    console.log("visible")
    // await this.setWeb3Instance()
    try {
      this.loading = true
      // this.infura = new Web3(new Web3.providers.HttpProvider(this.state.ethereum.endpoint))
      this.infura = new Web3(web3Provider)
      this.hdWallet = await createWallet()
    } catch (err) {
      console.error(err)
      this.ledgerLocked = true
      // feedback.showInfo("Please unlock your ledger and go to ethereum app")
      // this.$root.$emit("bv::show::modal", "unlock-ledger-modal")
      this.loading = false
      return
    }
    this.loading = false
  }

  async init() {
    // await this.setWeb3Instance()
    this.ledgerLocked = false
    try {
      this.loading = true
      this.hdWallet = await createWallet()
      this.loading = false
    } catch (err) {
      this.ledgerLocked = true
      // feedback.showInfo("Please unlock your ledger and go to ethereum app")
      // this.$root.$emit("bv::show::modal", "unlock-ledger-modal")
      this.loading = false
      return
    }
  }

}
</script>
<style lang="scss">
.account-list {
  counter-reset: address;
  max-height: calc(100vh - 300px);
  overflow-y: scroll;
  .list-group-item {
    display: flex;
    > address {
      margin: 0;
      font-family: Monaco, "Lucida Console", monospace;
      width: 260px;
      font-size: 14px;
    }
    &::before {
      display: block;
      text-align: center;
      padding-right: 10px;
      font-size: 12px;
      font-family: inherit;
      counter-increment: address;
      content: counter(address);
      width: 36px;
    }
    &.load-more::before,
    &.loading::before {
      content: "";
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
