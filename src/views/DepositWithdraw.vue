<template>
  <main class="container">
    <header>
      <h1>Wallet</h1>
      <b-button size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <b-alert :show="showHelp">
      These are your token balances on plasma chain...etc
      <br>(use $t with the key to some help text.)
    </b-alert>
    <b-card class="balances" no-body>
      <b-card-body v-if="filteredSymbols.length > 7 || inputFilter !== ''">
        <b-form-input v-model="inputFilter" placeholder="Search"></b-form-input>
      </b-card-body>
      <b-list-group flush>
        <b-list-group-item v-for="symbol in filteredSymbols" :key="symbol">
          <label class="symbol">{{symbol}}</label>
          <span class="balance">{{plasma.coins[symbol].balance | tokenAmount}}</span>
          <b-button-group class="actions">
            <b-button
              class="button"
              variant="outline-primary"
              @click="requestDeposit(symbol)"
            >Deposit</b-button>
            <b-button
              class="button"
              variant="outline-primary"
              @click="requestWithdraw(symbol)"
            >Withdraw</b-button>
            <b-button class="button" variant="outline-primary" @click="requestSwap(symbol)">Swap</b-button>
          </b-button-group>
        </b-list-group-item>
      </b-list-group>
      <b-card-footer>
        <b-button class="button" variant="primary" @click="requestAddToken()">Add token</b-button>
      </b-card-footer>
      <!-- <pre>{{(plasma.coins.BNB || {}).balance}}</pre>
      {{plasmaBalance}}-->
    </b-card>
    <transfer-tokens-form-modal @refreshTokenList="filterTokens"/>
    <add-token-modal @refreshTokenList="filterTokens"/>
    <DepositForm :token="selectedToken"/>
    <WithdrawForm :token="selectedToken"/>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import BN from "bn.js"

import DepositForm from "@/components/gateway/DepositForm.vue"
import WithdrawForm from "@/components/gateway/WithdrawForm.vue"
import TransferTokensFormModal from "@/components/modals/TransferTokensFormModal.vue"
import AddTokenModal from "@/components/modals/AddTokenModal.vue"

import { DashboardState } from "@//types"
import { PlasmaState } from "@/store/plasma/types"
import { gatewayModule } from "@/store/gateway"
import { plasmaModule } from "@/store/plasma"

import { BModal } from "bootstrap-vue"

import { tokenService } from "@/services/TokenService"
import { getWalletFromLocalStorage } from "../utils"
import { ethereumModule } from "../store/ethereum"
import { CommonTypedStore } from "../store/common"

@Component({
  components: {
    DepositForm,
    WithdrawForm,
    TransferTokensFormModal,
    AddTokenModal,
  }
})
export default class DepositWithdraw extends Vue {

  setShowDepositForm = gatewayModule.setShowDepositForm
  setShowWithdrawForm = gatewayModule.setShowWithdrawForm
  setShowErrorMsg = CommonTypedStore.setErrorMsg

  selectedToken = "LOOM"
  fields = ["symbol", "balance", "actions"]
  inputFilter = ""
  showHelp: boolean = false
  refreshBalance = plasmaModule.refreshBalance
  coins = this.plasma.coins

  // get the full list from state or somewhere else
  filteredSymbols: string[] = []

  get state(): DashboardState {
    return this.$store.state
  }

  get plasma(): PlasmaState {
    return this.state.plasma
  }

  get withdrawalInProgress(): boolean {
    // @ts-ignore
    const withdrawalBlock = JSON.parse(localStorage.getItem("latestWithdrawalBlock"))
    if (!withdrawalBlock) return false
    // 10 block confirmations + 5 for processing
    const result = (ethereumModule.state.blockNumber - 15) > withdrawalBlock ? false : true
    return result
  }

  async mounted() {
    const tokenSymbols = getWalletFromLocalStorage().map((symbol) => symbol)
    tokenSymbols.forEach((symbol) => {
      plasmaModule.addToken(symbol)
    })
    this.filterTokens()
  }

  modal(ref: string) {
    return this.$refs[ref] as BModal
  }

  @Watch("inputFilter")
  filterTokens() {
    const filter = this.inputFilter.toUpperCase()
    const tokenSymbols = Object.keys(this.plasma.coins)
    // return token if :
    // - no filter and symbol is in the state,
    // - symbol matches filter  and symbol is in the state,
    this.filteredSymbols = tokenSymbols
      .filter((symbol) => (filter === "" || symbol.includes(filter)))
  }

  requestDeposit(token: string) {
    this.selectedToken = token
    this.setShowDepositForm(true)
  }

  requestWithdraw(token: string) {

    if (!ethereumModule.state.blockNumber) {
      this.setShowErrorMsg("Synching with Ethereum, please wait a moment and try again.")
      return
    }

    if (this.withdrawalInProgress) {
      this.setShowErrorMsg("There is a processing withdrawal, please try again later.")
      return
    }
    this.selectedToken = token
    this.setShowWithdrawForm(true)
  }

  requestSwap(token: string) {
    plasmaModule.setSelectedToken(token)
    this.$root.$emit("bv::show::modal", "transfer-tokens-form-modal")
  }

  requestAddToken() {
    this.$root.$emit("bv::show::modal", "add-token-modal")
  }

}
</script>

<style lang="scss" scoped>
.container {
  margin: 16px auto;
  max-width: 600px;

  > header {
    display: flex;
    align-items: center;
    h1 {
      flex: 1;
    }
  }
}
.wallet-detail {
  padding: 24px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100px;
}

.card.balances {
  .list-group-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .symbol,
    .balance {
      line-height: 36px;
      margin: 0;
    }
    .symbol {
      text-transform: uppercase;
      font-weight: 600;
      width: 100px;
      color: #000;
    }
    .balance {
      flex: 1;
      text-align: right;
    }
    .actions {
      flex: 1;
    }
  }
}

/* Smartphones (portrait) ----------- */
@media only screen and (min-width: 520px) {
  .card.balances {
    .list-group-item {
      flex-wrap: nowrap;
      .balance,
      .actions {
        flex: 1;
      }
      .balance {
        padding: 0 16px;
      }
    }
  }
}
</style>
