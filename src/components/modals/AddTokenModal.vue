<template>
  <b-modal
    id="add-token-modal"
    ref="modalRef"
    title="Add New Token"
    hide-footer
    @show="resetModal"
    @hide="resetModal"
  >
    <b-card>
      <h6>Token Symbol</h6>
      <b-form-input
        v-model="selectedToken"
        list="token-symbol"
        id="input-with-list"
        placeholder="Search"
      ></b-form-input>
      <datalist id="token-symbol">
        <option v-for="token in filteredSymbols" :value="token" :key="token">{{ token }}</option>
      </datalist>
      <b-card v-if="selectedToken">
        <b-button type="button" variant="primary" @click="addToken">Add</b-button>
      </b-card>
    </b-card>
  </b-modal>
</template>

<script lang="ts">
import { Component, Watch, Vue, Prop, Provide } from "vue-property-decorator"
import Toptokens from "@/data/topTokensSymbol.json"
import { PlasmaState } from "../../store/plasma/types"
import { plasmaModule } from "../../store/plasma"
import { DashboardState } from "@/types"
import BN from "bn.js"
import { tokenService } from "@/services/TokenService"

@Component

export default class AddTokenModal extends Vue {
  selectedToken: string = "LOOM"
  filteredSymbols: string[] = []
  tokenSymbol: string[] = tokenService.getAllTokenSymbol()

  get state(): DashboardState {
    return this.$store.state
  }

  get plasma(): PlasmaState {
    return this.state.plasma
  }

  async mounted() {
    this.filterToken()
  }
  resetModal() {
    this.selectedToken = ""
  }

  get token() {
    return this.tokenSymbol.find((token) => token === this.selectedToken)
  }

  @Watch("selectedToken")
  filterToken() {
    const filter = this.selectedToken
    this.filteredSymbols = this.tokenSymbol
      .filter((token) => (token.includes(filter) || filter === ""))
  }

  addToken() {
    plasmaModule.addToken(this.selectedToken)
    this.$root.$emit("bv::hide::modal", "add-token-modal")
    this.$emit("refreshTokenList")
  }
}
</script>

<style>
</style>
