<template>
    <b-modal
    id="add-token-modal"
    ref="modalRef"
    title="Add New Token"
    hide-footer
    @show="resetModal"
    @hide="resetModal">
      <b-card>
        <h6>Token Symbol</h6>
        <b-form-input v-model="selectedToken" list="token-synbol" id="input-with-list" placeholder="Search"></b-form-input>
        <datalist id="token-synbol">
          <option v-for="token in filteredSymbols" :value="token" :key="token">{{ token }}</option>
        </datalist>
        <b-card v-if="selectedToken">
          <h4>{{ selectedToken }}</h4>
          <p>{{ tokenSelected.name }}</p>
          <b-button 
            type="button"
            variant="primary"
            @click="addToken"
            >Add</b-button>
        </b-card>
        {{this.plasma.coins}}
      </b-card>
    </b-modal>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import Toptokens from "@/data/topTokensSymbol.json"
import { PlasmaState } from "../../store/plasma/types";
import { plasmaModule } from '../../store/plasma';
import { DashboardState } from "@/types"
import BN from "bn.js"

@Component

export default class TransferTokensFormModal extends Vue {
    selectedToken: string = ""
    tokenSymbol: string[] = []
    filteredSymbols: string[] = []
    // tokenSelected= false

    get state(): DashboardState {
      return this.$store.state
    }

    get plasma(): PlasmaState {
      return this.state.plasma
    }

    mounted(){
      Toptokens.tokens.forEach(token => {
        this.tokenSymbol.push(token.symbol)
      })
      this.filterToken()
    }
    resetModal(){
      this.selectedToken = ""
    }

    get tokenSelected (){
      return Toptokens.tokens.filter(token => token.symbol === this.selectedToken)[0]
    }

    @Watch("selectedToken")
    filterToken(){
    const filter = this.selectedToken.toUpperCase()
    this.filteredSymbols = this.tokenSymbol
      .filter((token) => (token.includes(filter) || filter === ""))
    }

    addToken(){
      const symbol = this.selectedToken.toLowerCase()
      this.plasma.coins[symbol] = {balance: new BN("0"), loading: false}

      this.$root.$emit("bv::hide::modal", "add-token-modal")
    }

}
</script>

<style>
</style>
