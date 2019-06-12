<template>
  <b-modal id="select-token-modal" hide-footer>
    <template slot="modal-title">{{ title }}</template>
    <b-form-group label="From">
      <div class="button-group">
        <div class="token-option" @click="onNext(`ethereum`)">
          <p>Ethereum</p>
          <img src="../../assets/ethereum_logo.png" class="logo" alt="">
        </div>
        <div class="token-option" @click="onNext(`binance`)">
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

@Component
export default class SelectTokenModal extends Vue {
  @Prop(String) type: string = ""

  get title() {
    return capitalize(this.type.toLowerCase())
  }
  onNext(tokenSymbol: string) {
    this.$emit("selectedToken", {
      type: this.type,
      token: tokenSymbol,
    })
    this.$root.$emit("bv::hide::modal", "select-token-modal")
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
.token-option {
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
