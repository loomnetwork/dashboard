<template>
  <main class="container">
    <header>
      <h1>Wallet</h1>
      <b-button class="help" variant="outline-info" pill size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <b-alert fade :show="showHelp">
      Check your token balances
      <hr>
      <div class="helpAlert">
        <p>
          <b>Deposit</b> : Deposit to Plasmachain from Ethereuem
        </p>
        <p>
          <b>Withdraw</b> : Withdraw to Ethereum
        </p>
        <b>Transfer</b> : Transfer tokens to other PlasmaChain accounts
      </div>
    </b-alert>
    <Account/>
    <b-card class="balances" no-body>
      <b-card-body v-if="filteredSymbols.length > 7 || inputFilter !== ''">
        <b-form-input v-model="inputFilter" placeholder="Filter"></b-form-input>
      </b-card-body>
      <b-list-group flush>
        <b-list-group-item v-for="symbol in filteredSymbols" :key="symbol">
          <label class="symbol">{{symbol}}</label>
          <span
            class="balance"
          >{{plasma.coins[symbol].balance | tokenAmount(plasma.coins[symbol].decimals)}}</span>
          <b-button-group class="actions">
            <b-button
              class="button"
              variant="outline-primary"
              :disabled="disableDeposit"
              @click="requestCrossChainTranfer(DEPOSIT, symbol)"
            >Deposit</b-button>
            <b-button
              class="button"
              variant="outline-primary"
              :disabled="disableTransfer || plasma.coins[symbol].balance.isZero()"
              @click="requestCrossChainTranfer(WITHDRAW, symbol)"
            >
              <span>Withdraw</span>
            </b-button>
            <b-button
              class="button"
              variant="outline-primary"
              :disabled="disableTransfer || plasma.coins[symbol].balance.isZero()"
              @click="requestSwap(symbol)"
            >Transfer</b-button>
          </b-button-group>
        </b-list-group-item>
      </b-list-group>
      <b-card-footer>
        <b-button class="button" variant="primary" @click="requestAddToken()">Add token</b-button>
      </b-card-footer>
    </b-card>
    <transfer-tokens-form-modal @refreshTokenList="filterTokens" :token="selectedToken"/>
    <add-token-modal @refreshTokenList="filterTokens"/>
    <DepositForm :token="selectedToken"/>
    <WithdrawForm :token="selectedToken"/>
    <SelectChainModal/>
    <DepositBinance/>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import BN from "bn.js"

import DepositForm from "@/components/gateway/DepositForm.vue"
import WithdrawForm from "@/components/gateway/WithdrawForm.vue"
import TransferTokensFormModal from "@/components/modals/TransferTokensFormModal.vue"
import SelectChainModal from "@/components/modals/SelectChainModal.vue"
import DepositBinance from "@/components/gateway/DepositBinance.vue"
import AddTokenModal from "@/components/modals/AddTokenModal.vue"
import Account from "@/components/Account.vue"

import { DashboardState } from "@//types"
import { PlasmaState } from "@/store/plasma/types"
import { gatewayModule } from "@/store/gateway"
import { plasmaModule } from "@/store/plasma"

import { tokenService } from "@/services/TokenService"
import { getWalletFromLocalStorage } from "../utils"
import { ethereumModule } from "@/store/ethereum"
import { feedbackModule } from "@/feedback/store"

@Component({
  components: {
    DepositForm,
    WithdrawForm,
    TransferTokensFormModal,
    AddTokenModal,
    SelectChainModal,
    DepositBinance,
    Account,
  },
})
export default class DepositWithdraw extends Vue {

  DEPOSIT = "DEPOSIT"
  WITHDRAW = "WITHDRAW"
  setShowDepositForm = gatewayModule.setShowDepositForm
  setShowWithdrawForm = gatewayModule.setShowWithdrawForm
  showError = feedbackModule.showError

  selectedToken = "LOOM"
  fields = ["symbol", "balance", "actions"]
  inputFilter = ""
  showHelp: boolean = false
  refreshBalance = plasmaModule.refreshBalance
  selectChainModalType: string = ""
  coins = this.plasma.coins

  // get the full list from state or somewhere else
  filteredSymbols: string[] = []

  get state(): DashboardState {
    return this.$store.state
  }

  get txInProgress(): boolean {
    return feedbackModule.state.isLoading
  }

  get disableDeposit(): boolean {
    return this.txInProgress
  }

  get disableWithdraw(): boolean {
    return !this.currentBlockNumber || !this.pastTxHasExpired || this.txInProgress
  }

  get currentBlockNumber(): number {
    return ethereumModule.state.blockNumber
  }

  get latestWithdrawalBlock(): number {
    return ethereumModule.state.latestWithdrawalBlock
  }

  get pastTxHasExpired() {
    if (this.latestWithdrawalBlock === 0) return true
    return ethereumModule.state.claimedReceiptHasExpired
  }

  get disableTransfer(): boolean {
    return this.txInProgress
  }

  get plasma(): PlasmaState {
    return this.state.plasma
  }

  async mounted() {
    const tokenSymbols = getWalletFromLocalStorage().map((symbol) => symbol)
    tokenSymbols.forEach((symbol) => plasmaModule.addToken(symbol))
    this.filterTokens()

    if (this.$route.query.depositCoin === "LOOM") {
      this.selectedToken = "LOOM"
      this.setShowDepositForm(true)
    }
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

  /**
   * set selected token to component state
   * then show selectChain modal
   */
  requestCrossChainTranfer(type: string, token: string) {
    this.selectChainModalType = type
    this.selectedToken = token
    console.log("dss", this.state.chains)
    const chain = this.state.chains.length === 1 ? this.state.chains[0] : ""
    gatewayModule.setTransferRequest({ chain, type, token })
  }

  requestSwap(token: string) {
    this.selectedToken = token
    this.$root.$emit("bv::show::modal", "transfer-tokens-form-modal")
  }

  requestAddToken() {
    this.$root.$emit("bv::show::modal", "add-token-modal")
  }
}
</script>

<style lang="scss" scoped>
.container {
  > header {
    display: flex;
    align-items: center;
    h1 {
      flex: 1;
      color: #5246d5;
      font-size: 1.35em;
      text-align: center;
      margin: 16px -14px;
      font-weight: normal;
      border-bottom: 1px solid #ededed;
      padding-bottom: 16px;
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
  margin: 16px auto;
  max-width: 600px;
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

.helpAlert p {
  color: #0e4a55;
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
