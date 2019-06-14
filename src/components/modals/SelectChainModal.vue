<template>
  <b-modal id="select-chain-modal" hide-footer>
    <template slot="modal-title">{{ title }}</template>
    <b-form-group label="From">
      <div class="button-group">
        <div class="chain-option" @click="onSelect(`ethereum`)" v-if="showButton(`ethereum`)">
          <p>Ethereum</p>
          <img src="../../assets/ethereum_logo.png" class="logo" alt="">
        </div>
        <div class="chain-option" @click="onSelect(`binance`)" v-if="showButton(`binance`)">
          <p>Binance</p>
          <img src="../../assets/binance_logo.png" class="logo" alt="">
        </div>
      </div>
    </b-form-group>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { capitalize } from "@/utils"
import { DashboardState } from "../../types"

@Component
export default class SelectChainModal extends Vue {
  @Prop(String) type: string = ""

  get title() {
    return capitalize(this.type.toLowerCase())
  }

  get state(): DashboardState {
    return this.$store.state
  }

  showButton(chain: string) {
    const chains = this.state.chains
    const disabled = this.state.disabled
    return chains.includes(chain) && !disabled.includes(chain)
  }

  onSelect(chain: string) {
    this.$emit("selectedChain", {
      type: this.type,
      chain,
    })
    this.$root.$emit("bv::hide::modal", "select-chain-modal")
  }
}
</script>

<style lang="scss" scoped>
.logo {
  height: 80px;
}
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.chain-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  padding: 1em;
  padding-bottom: 1.5em;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0;
  margin: 1em;
  &:hover {
    cursor: pointer;
    box-shadow: rgba(219, 219, 219, 0.56) 0px 6px 8px 0;
    background-color: rgba(0, 0, 0, 0.01);
  }
}
.footer-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
