<template>
  <div>
    <b-row>
      <b-col>
        <b-form-input id="input-amount" v-model="amount" :formatter="format" placeholder="Enter amount">
        </b-form-input>
      </b-col>
      <b-col sm="4">
        <b-button variant="outline-primary" @click="setAllAmount">All (LOOM)</b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator"
@Component
export default class AmountInput extends Vue {
  @Prop(Number) min: number = 0
  @Prop(Number) max!: number
  @Prop(Boolean) round: boolean = true

  // State declaration
  amount: number = 0

  // Call this function when amount changed
  @Watch("amount")
  onAmountChanged(newVal, oldVal) {
    this.$emit("input", this.amount)
  }

  // Button Action
  setAllAmount() {
    this.amount = this.max
  }
}
</script>

<style scoped>
</style>
