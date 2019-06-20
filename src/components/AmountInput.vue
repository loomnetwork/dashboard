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
          @keyup="validateAmount"
        ></b-form-input>
        <p v-if="errorMsg">{{ errorMsg }}</p>
      </b-col>
      <b-col>
        <b-button variant="outline-primary" @click="setAllAmount">All balance</b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator"
import BN from "bn.js"
import { formatTokenAmount } from "@/filters"
import { parseToWei } from "@/utils"
import BigNumber from "bignumber.js"

@Component
export default class AmountInput extends Vue {
  @Prop() value!: any // v-model is it accepts a value prop and emit an input event.

  /**
   * in wei
   */
  @Prop(Object) min!: BN
  /**
   * in wei
   */
  @Prop(Object) max!: BN
  @Prop(String) symbol!: string
  @Prop({ default: true }) round!: boolean

  /**
   * User input is in token
   */
  amount: number | "" = ""
  errorMsg: string = ""

  // Call this function when amount changed. emits valud in WEI
  @Watch("amount")
  onAmountChanged(newVal, oldVal) {
    const amountBN = parseToWei(this.amount.toString())
    this.$emit("input", amountBN)
  }

  // Set default amount when select another token
  @Watch("symbol")
  setDefaultAmount(newVal, oldVal) {
    this.amount = 0
    this.validateAmount()
  }

  validateAmount() {
    let amount = Number(this.amount)
    if (!amount) {
      this.errorMsg = "Please enter a valid amount"
      this.$emit("isError", true)
      return
    }
    if (this.round && Number.isInteger(amount) === false) {
      this.errorMsg = "Only round amounts allowed"
      this.$emit("isError", true)
      return
    }
    const amountBN = parseToWei("" + amount)
    const max = this.max
    const min = this.min
    if (amountBN.gt(max)) {
      this.errorMsg = this.$t("messages.amount_input_should_less", { amount: max }).toString()
      this.$emit("isError", true)
    } else if (amountBN.lt(min)) {
      this.errorMsg = this.$t("messages.amount_input_should_more", { amount: min }).toString()
      this.$emit("isError", true)
    } else {
      this.errorMsg = ""
      this.$emit("isError", false)
    }
  }

  // Button Action
  setAllAmount() {
    this.amount = Number(formatTokenAmount(this.max))
    this.validateAmount()
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
