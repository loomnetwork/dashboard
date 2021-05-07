<template>
  <main class="container">
    <header>
      <h1>{{ $t('views.deposit_withdraw.wallet' )}}</h1>
      <b-button class="help" variant="outline-info" pill size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <b-alert fade :show="showHelp">
      {{ $t('views.help.check_your_balance' )}}
      <hr />
      <div class="helpAlert">
        <p>
          <b>{{ $t('views.my_account.deposit' )}}</b> : {{ $t('views.help.deposit_to_plasmachain', { network: foreignNetworkName }) }}
        </p>
        <p>
          <b>{{ $t('views.my_account.withdraw' )}}</b> : {{ $t('views.help.withdraw_to_ethereum', { network: foreignNetworkName }) }}
        </p>
        <b>{{ $t('components.gameAsset.cards.transfer' )}}</b> : {{ $t('views.help.transfer_token' )}}
      </div>
    </b-alert>
    <Account />
    <b-card class="balances" no-body>
      <b-card-header class="custom-card-header d-flex justify-content-between">
        <h5>{{ $t('views.deposit_withdraw.tokens' )}}</h5>
        <a @click="refreshAllTokens">
          <fa :icon="['fas', 'sync']" class="refresh-icon" />
        </a>
      </b-card-header>
      <b-card-body v-if="filteredSymbols.length > 7 || inputFilter !== ''">
        <b-form-input v-model="inputFilter" :placeholder="$t('input_placeholder.filter')"></b-form-input>
      </b-card-body>
      <b-list-group flush>
        <b-list-group-item v-for="symbol in filteredSymbols" :key="symbol">
          <label class="symbol">{{symbol}}</label>
          <span
            class="balance"
          >{{plasma.coins[symbol].balance | tokenAmount(plasma.coins[symbol].decimals, 3)}}</span>
          <b-button-group class="actions">
            <b-button
              style="display:flex"
              class="button"
              variant="outline-primary"
              :disabled="txInProgress || !allowDeposit(symbol)"
              @click="requestCrossChainTransfer(DEPOSIT, symbol)"
            >
              {{ $t('views.my_account.deposit' )}}
              <b-badge variant="warning" v-if="symbol in ethereumAllowances">!</b-badge>
            </b-button>
            <b-button
              class="button"
              variant="outline-primary"
              :disabled="txInProgress || plasma.coins[symbol].balance.isZero() || !allowWithdraw(symbol)"
              @click="requestCrossChainTransfer(WITHDRAW, symbol)"
            >
              <span>{{ $t('views.my_account.withdraw' )}}</span>
            </b-button>
            <b-button
              class="button"
              variant="outline-primary"
              :disabled="txInProgress || plasma.coins[symbol].balance.isZero()"
              @click="requestSwap(symbol)"
            >{{ $t('components.gameAsset.cards.transfer' )}}</b-button>
          </b-button-group>
        </b-list-group-item>
      </b-list-group>
      <b-card-footer>
        <b-button class="button" variant="primary" @click="requestAddToken()">{{ $t('views.deposit_withdraw.add_token') }}</b-button>
      </b-card-footer>
    </b-card>
    <transfer-tokens-form-modal @refreshTokenList="filterTokens" :token="selectedToken" />
    <add-token-modal @refreshTokenList="filterTokens" />
    <DepositForm :token="selectedToken" />
    <WithdrawForm :token="selectedToken" />
    <SelectChainModal />
    <DepositBinance />
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

import { tokenService, TokenData } from "@/services/TokenService"
import { getWalletFromLocalStorage } from "../utils"
import { ethereumModule } from "@/store/ethereum"
import { feedbackModule } from "@/feedback/store"
import { Subscription, timer } from "rxjs"

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

  refreshTimer: Subscription | null = null

  // get the full list from state or somewhere else
  filteredSymbols: string[] = []

  ethereumAllowances: { [symbol: string]: { token: TokenData, amount: BN } } = {}

  get state(): DashboardState {
    return this.$store.state
  }

  get foreignNetworkName() {
    return this.state.ethereum.genericNetworkName
  }

  get txInProgress(): boolean {
    return feedbackModule.state.isLoading
  }

  allowDeposit(symbol: string): boolean {
    return !!tokenService.get(symbol)
  }

  allowWithdraw(symbol: string): boolean {
    return !!tokenService.get(symbol)
  }

  get currentBlockNumber(): number {
    return ethereumModule.state.blockNumber
  }

  get latestWithdrawalBlock(): number {
    return ethereumModule.state.latestWithdrawalBlock
  }

  get plasma(): PlasmaState {
    return this.state.plasma
  }

  async mounted() {
    // TODO move this to store
    const supported = tokenService.symbols.map((token) => token.plasma)
    // Binance and Ethereum have different supported token lists
    const walletId = this.state.ethereum.nativeTokenSymbol === "BNB" ? (this.state.env + ".binance") : this.state.env
    getWalletFromLocalStorage(walletId)
      .filter((address) => supported.includes(address))
      .forEach((address) => plasmaModule.addToken({
          token: tokenService.tokenFromAddress(address, "plasma")!,
          walletId,
      }))

    this.filterTokens()

    if (this.$route.query.depositCoin === "LOOM") {
      this.selectedToken = "LOOM"
      this.setShowDepositForm(true)
    }

    this.setRefreshTimer()

  }

  setRefreshTimer() {
    this.refreshTimer = timer(0, 15000).subscribe(() => {
      this.refreshAllTokens()
    })
  }

  refreshAllTokens() {
    this.filteredSymbols.forEach(async (symbol) => {
      await this.refreshBalance(symbol)
    })
  }

  beforeDestroy() {
    if (this.refreshTimer != null) {
      this.refreshTimer.unsubscribe()
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

  @Watch("state.gateway.ethereumAllowances")
  onDepositAllowanceChange(allowances: Array<{ token: TokenData, amount: BN }>) {
    console.log("onDepositAllowanceChange")
    this.ethereumAllowances = allowances.reduce((obj, entry) => {
      obj[entry.token.symbol] = entry
      return obj
    }, {})
  }

  /**
   * set selected token to component state
   * then show selectChain modal
   */
  async requestCrossChainTransfer(type: string, token: string) {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
    this.selectChainModalType = type
    this.selectedToken = token
    // Check if these token has a binance
    const tokenInfo = tokenService.getTokenbySymbol(token)
    const possibleChains = this.state.chains.filter((chainId) => !!tokenInfo[chainId])
    const chain = (possibleChains.length === 1) ?
      possibleChains[0] : ""
    gatewayModule.setTransferRequest({ chain, type, token })
  }

  async requestSwap(token: string) {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
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
      font-variant-numeric: tabular-nums;
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

