<template>
  <main class="container">
    <header>
      <h1>Wallet</h1>
      <b-button size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <transfer-tokens-form-modal @refreshTokenList="filterTokens"/>
    <add-token-modal @refreshTokenList="filterTokens"/>
    <DepositForm/>
    <b-alert :show="showHelp">
      These are your token balances on plasma chain...etc
      <br>(use $t with the key to some help text.)
    </b-alert>
    <b-card class="balances" no-body>
      <b-card-body>
        <b-form-input v-model="inputFilter" placeholder="Search"></b-form-input>
      </b-card-body>
      <b-list-group flush>
        <b-list-group-item v-for="symbol in filteredSymbols" :key="symbol">
          <label class="symbol">{{symbol}}</label>
          <!-- BNB: {{plasmaBalance}} -->
          <span class="balance">{{plasma.coins[symbol].balance | tokenAmount}}</span>
          <b-button-group class="actions">
            <b-button
              class="button"
              variant="outline-primary"
              @click="requestDeposit(true,symbol)"
            >Deposit</b-button>
            <b-button
              class="button"
              variant="outline-primary"
              @click="requestWithdraw(symbol)"
            >Withdraw</b-button>
            <b-button
              class="button"
              variant="outline-primary"
              @click="requestSwap(symbol)"
            >Swap</b-button>
          </b-button-group>
        </b-list-group-item>
      </b-list-group>
      <b-card-footer>
        <b-button
          class="button"
          variant="primary"
          @click="requestAddToken()"
        >Add token</b-button>
      </b-card-footer>
      <!-- <pre>{{(plasma.coins.BNB || {}).balance}}</pre>
      {{plasmaBalance}} -->
    </b-card>
  </main>
</template>

<script lang="ts">
import DepositForm from "@/components/gateway/DepositForm.vue"
import TransferTokensFormModal from "@/components/modals/TransferTokensFormModal.vue";
import AddTokenModal from "@/components/modals/AddTokenModal.vue"
import { Component, Watch, Vue } from "vue-property-decorator"
import BN from "bn.js"
import { DashboardState } from "../types"
import { PlasmaState } from "../store/plasma/types"
import { Modal } from "bootstrap-vue";
import { plasmaModule } from "../store/plasma"
import { refreshBalance } from '../store/ethereum'
import * as Mutations from "@/store/plasma/mutations"
import { debuglog } from 'util';

@Component({
  components: {
    DepositForm,
    TransferTokensFormModal,
    AddTokenModal,
  },
  methods: {
    // ...DPOSStore.mapMutations([
    //   "setShowDepositForm",
    // ]),
  },
})
export default class DepositWithdraw extends Vue {
  fields = ["symbol", "balance", "actions"]
  inputFilter = ""
  showHelp: boolean = false
  refreshBalance = plasmaModule.refreshBalance

  // get the full list from state or somewhere else
  filteredSymbols: string[] = []

  get state(): DashboardState {
    return this.$store.state
  }

  get plasma(): PlasmaState {
    return this.state.plasma
  }

  get plasmaBalance(): BN {
    return (this.state.plasma.coins["bnb"] || {}).balance
  }

  mounted() {
    this.filterTokens()
  }

   modal(ref: string) {
     return this.$refs[ref] as Modal
  }

  @Watch("inputFilter")
  filterTokens() {
    const filter = this.inputFilter.toLowerCase()
    const coins = this.state.plasma.coins
    // return token if :
    // - no filter and symbol is in the state,
    // - symbol matches filter  and symbol is in the state,
    this.filteredSymbols = Object.keys(coins)
      .filter((symbol) => (filter === "" || symbol.includes(filter)) && symbol in coins)
  }

  requestDeposit(token: string) {
    this.$root.$emit("bv::show::modal", "deposit-form")
  }

  requestWithdraw(token: string) {
  }

  requestSwap(token: string) {
    Mutations.setSelectedToken(this.plasma, token)
    this.$root.$emit("bv::show::modal", "transfer-tokens-form-modal")
  }

  requestAddToken(){
    this.$root.$emit("bv::show::modal", "add-token-modal")
  }

  async ready() {
    // const tokenDetail = await Promise.all([this.getTokensDetails()])
    // const [allToken] = tokenDetail
    // const ethBalance = parseFloat(this.dappchainBalance.ETH * Math.pow(10, 18)).toFixed(2) // Eth plasma
    // const ethToken = {
    //   filename: "Ethereum",
    //   name: "ETH",
    //   decimal: 18,
    //   symbol: "ETH",
    //   address: user.ethAddress, // set ethAddress to wallet
    //   balance: ethBalance,
    // }
    // this.tokens = [...allToken]
    // const tokensSymbol = this.tokens
    //   .map((token) => this.updateCurrentToken({symbol: token.symbol}))

    // this.balance = await this.getBalance("ETH")
    // await Promise.all(tokensSymbol.slice(0, 20))
    // await Promise.all(tokensSymbol.slice(20, 40))
    // await Promise.all(tokensSymbol.slice(40, 60))
    // await Promise.all(tokensSymbol.slice(60, 80))
    // await Promise.all(tokensSymbol.slice(80))
    // this.tokens = this.tokens.map((token) => {
    //   if (!this.dappchainBalance[token.symbol]) return
    //   return {...token, balance: this.dappchainBalance[token.symbol]}
    // })
    // this.filteredToken = this.tokens
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
