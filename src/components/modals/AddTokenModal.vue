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
        v-model="searchText"
        list="token-symbol"
        id="input-with-list"
        :placeholder="$t('input_placeholder.search')"
        type="search"
      ></b-form-input>
      <div class="virtual-list mt-3">
        <virtual-list :size="30" :remain="8">
          <div
            v-for="token in filteredTokens"
            @click="addToken(token)"
            class="list-item"
            :key="token.plasma"
          >
            <h6 class="mb-1">{{ token.symbol }}</h6>
            <small>{{ token.plasma }}</small>
          </div>
        </virtual-list>
      </div>
    </b-card>
  </b-modal>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import VirtualList from "vue-virtual-scroll-list"
import { plasmaModule } from "../../store/plasma"
import { tokenService, TokenData } from "@/services/TokenService"
import { DashboardState } from "@/types"

@Component({
  components: {
    VirtualList,
  },
})
export default class AddTokenModal extends Vue {
  searchText: string = ""
  filteredTokens: TokenData[] = []

  get state(): DashboardState {
    return this.$store.state
  }

  async mounted() {
    this.filterToken()
  }

  resetModal() {
    this.searchText = ""
  }

  @Watch("searchText")
  filterToken() {
    const filter = this.searchText.toLowerCase()
    this.filteredTokens = tokenService.tokens.filter((token) =>
      token.symbol &&
      (token.symbol.toLowerCase().includes(filter) || filter === ""),
    )
  }

  addToken(token) {
    const walletId = this.state.ethereum.nativeTokenSymbol === "BNB" ? (this.state.env + ".binance") : this.state.env
    plasmaModule.addToken({ token, walletId })
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
