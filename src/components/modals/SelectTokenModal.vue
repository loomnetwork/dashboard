<template>
  <b-modal id="select-token-modal">
    <template slot="modal-title">{{ title }}</template>
    <b-form-group label="From">
      <div class="button-group">
        <b-form-radio v-model="selected" name="eth-button" value="ethereum">
          <div class="token-option">
            <p>Ethereum</p>
            <p>IMG</p>
          </div>
        </b-form-radio>
        <b-form-radio v-model="selected" name="bnb-button" value="binance">
          <div class="token-option">
            <p>Binance</p>
            <p>IMG</p>
          </div>
        </b-form-radio>
      </div>
    </b-form-group>
    <div slot="modal-footer" class="w-100 footer-button">
      <b-button @click="$bvModal.hide('select-token-modal')">Cancel</b-button>
      <b-button variant="primary" @click="onNext">Next</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import { capitalize } from "@/utils"

@Component
export default class SelectTokenModal extends Vue {
  @Prop(String) type: string = ""

  selected: string = "ethereum"

  get title() {
    return capitalize(this.type)
  }
  onNext() {
    this.$emit("selectedToken", {
      type: this.type,
      token: this.selected,
    })
    this.$root.$emit("bv::hide::modal", "select-token-modal")
  }
}
</script>

<style lang="scss" scoped>
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.token-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.footer-button {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
