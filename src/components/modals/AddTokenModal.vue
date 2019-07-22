<template>
  <b-modal
    id="add-token-modal"
    ref="modalRef"
    :title="$t('components.modals.add_token_modal.add_new')"
    hide-footer
    @show="resetModal"
    @hide="resetModal"
  >
    <b-card>
      <h6>{{ $t('components.modals.add_token_modal.token_symbol') }}</h6>
      <b-form-input
        v-model="selectedToken"
        list="token-symbol"
        id="input-with-list"
        :placeholder="$t('components.modals.add_token_modal.search')"
      ></b-form-input>
      <div class="virtual-list mt-3">
        <virtual-list :size="30" :remain="8">
          <div v-for="token in filteredSymbols"
                  @click="addToken(token)"
                  class="list-item"
                  :value="token"
                  :key="token">{{ token }}</div>
        </virtual-list>
      </div>
    </b-card>
  </b-modal>
</template>

<script lang="ts">
import { Component, Watch, Vue, Prop, Provide } from "vue-property-decorator"
import VirtualList from "vue-virtual-scroll-list"
import Toptokens from "@/data/topTokensSymbol.json"
import { PlasmaState } from "../../store/plasma/types"
import { plasmaModule } from "../../store/plasma"
import { DashboardState } from "@/types"
import BN from "bn.js"
import { tokenService } from "@/services/TokenService"

@Component({
  components: {
    VirtualList,
  },
})
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
    const filter = this.selectedToken.toLowerCase()
    this.filteredSymbols = this.tokenSymbol
      .filter((token) => (token.toLowerCase().includes(filter) || filter === ""))
  }

  addToken(token) {
    plasmaModule.addToken(token)
    this.$root.$emit("bv::hide::modal", "add-token-modal")
    this.$emit("refreshTokenList")
  }
}
</script>

<style lang="scss" scoped>
  .virtual-list {
    border: 1px solid #ced4da;
    border-radius: 3px;
  }
  .list-item {
    border-bottom: 1px solid #ced4da;
    padding: 8px 12px;
  }
</style>
