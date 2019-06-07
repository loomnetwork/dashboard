<template>
  <div>
    <b-row>
      <b-col>
        <b-form-input
          id="input-amount"
          v-model="amount"
          :type="'number'"
          placeholder="Enter amount"
          aria-describedby="input-live-help input-live-feedback"
          @keyup="validateAmount">
        </b-form-input>
        <p v-if="errorMsg">{{ errorMsg }}</p>
      </b-col>
      <b-col sm="4">
        <b-button variant="outline-primary" @click="setAllAmount">All ({{ state.plasma.tokenSelected }})</b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator"
import { DashboardState } from "@/types"
import  BN  from "bn.js";
import { formatTokenAmount } from "@/filters"

@Component
export default class AmountInput extends Vue {
  @Prop(Number) value!: any // v-model is it accepts a value prop and emit an input event.
  @Prop(Number) min!: number
  @Prop(Number) max!: number
  @Prop({default: true}) round!: boolean

  // State declaration
  amount: any = ""
  errorMsg: string = ""

  // Call this function when amount changed
  @Watch("amount")
  onAmountChanged(newVal, oldVal) {

    const amount = new BN(this.amount).mul(new BN("" + 10 ** 18))
    const strAmount = formatTokenAmount(amount)
    this.$emit("input", Number(strAmount))
  }

  // Set default amount when select another token
  @Watch("state.plasma.tokenSelected")
  setDefaultAmount(newVal, oldVal) {
    this.amount = 0
  }

  validateAmount() {
    let amount = this.amount
    if (this.round) {
      amount = Math.floor(this.value)
    }
    if (!this.amount) {
      this.errorMsg = ""
      this.$emit("isError", true)
    } else if (amount > this.max) {
      this.errorMsg = this.$t("messages.amount_input_should_less", { amount: this.max }).toString()
      this.$emit("isError", true)
    } else if (amount < this.min) {
      this.errorMsg = this.$t("messages.amount_input_should_more", { amount: this.min }).toString()
      this.$emit("isError", true)
    } else {
      this.errorMsg = ""
      this.$emit("isError", false)
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }
  // Button Action
  setAllAmount() {
    this.amount = this.max
  }

  mounted() {
    this.amount = 0
  }
}
</script>

<style scoped>
p {
  margin-top: 0.2em;
  font-size: 0.9em;
  color: red;
}

input:invalid {
  /* Override Style => ignore invalid when input float amount */
  border: 1px solid #ced4da;
  color: #495057;
}
</style>
