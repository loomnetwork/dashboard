<template>
  <div>
    <b-row>
      <b-col>
        <b-form-input
          id="input-amount"
          v-model="amount"
          :type="'number'"
          :placeholder="$t('input_placeholder.enter_amount')"
          aria-describedby="input-live-help input-live-feedback"
          @keyup="validateAmount"
        ></b-form-input>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </b-col>
      <b-col>
        <b-button variant="outline-primary" @click="setAllAmount" style="min-width:100px">{{ $t('components.amount_input.all') }}</b-button>
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
import { tokenService } from "../services/TokenService"

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

  @Prop({ default: 18 }) decimals!: number
  /**
   * User input is in token
   */
  amount: number | "" = ""
  errorMsg: string = ""

  // Call this function when amount changed. emits valud in WEI
  @Watch("amount")
  onAmountChanged(newVal, oldVal) {
    const amountBN = parseToWei(this.amount.toString(), this.decimals)
    this.$emit("input", amountBN)
  }

  // Set default amount when select another token
  @Watch("symbol")
  setDefaultAmount(newVal, oldVal) {
    this.validateAmount()
  }

  validateAmount() {
    this.decimals = tokenService.getTokenbySymbol(this.symbol).decimals
    const amount = Number(this.amount)
    const amountBN = parseToWei("" + amount, this.decimals)
    const max = this.max
    const min = this.min

    if (!amount) {
      this.errorMsg = this.$t("messages.amount_input_invalid_amount").toString()
      this.$emit("isError", true)
      return
    }
    if (this.round && Number.isInteger(amount) === false && !amountBN.eq(max)) {
      this.errorMsg = this.$t("messages.amount_input_only_round_amount").toString()
      this.$emit("isError", true)
      return
    }
    if (amountBN.gt(max)) {
      this.errorMsg = this.$t(
        "messages.amount_input_should_less",
        { amount: formatTokenAmount(max, this.decimals) },
      ).toString()
      this.$emit("isError", true)
    } else if (amountBN.lt(min)) {
      this.errorMsg = this.$t(
        "messages.amount_input_should_more",
        { amount: formatTokenAmount(min, this.decimals) },
      ).toString()
      this.$emit("isError", true)
    } else {
      this.errorMsg = ""
      this.$emit("isError", false)
    }
  }

  // Button Action
  setAllAmount() {
    // @ts-ignore
    this.amount = new BigNumber(this.max.toString()).div(10 ** this.decimals).toFixed()
    this.errorMsg = ""
    this.$emit("isError", false)
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
