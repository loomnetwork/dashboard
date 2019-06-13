<template>
  <b-modal
    lazy
    id="deposit-form"
    title="BootstrapVue"
    v-model="visible"
    :busy="true"
    no-close-on-esc
    no-close-on-backdrop
    hide-header-close>
    <template slot="modal-title">Approve deposit</template>
    <div v-if="!status">
      <form>
        <amount-input :min="1" :max="userBalance" v-model="depositAmount" :symbol="token" @isError="errorHandler" />
        <div class="error" v-for="e in amountErrors" :key="e">- {{e}}</div>
      </form>
    </div>
    <div v-else-if="status === 'sending'">
      <p class="lead">{{ $t("components.gateway.approval.sending") }}</p>
    </div>
    <div v-else-if="status === 'failed'">
      <p class="lead">{{ $t("components.gateway.approval.failure") }}</p>
      <b-btn @click="close" variant="primary">Close</b-btn>
    </div>
    <div v-else-if="status === 'sent'">
      <p class="lead">{{ $t("components.gateway.approval.sent") }}</p>
      <b-btn @click="close" variant="primary">Close</b-btn>
    </div>
    <template slot="modal-footer">
      <b-btn @click="close()">Cancel</b-btn>
      <span style="flex:1"></span>
      <b-btn @click="sendApproval" variant="primary" :disabled="hasErrors">Confirm</b-btn>
    </template>    
  </b-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { ethers } from "ethers"
import BN from "bn.js"
import { formatToCrypto, parseToWei } from "@/utils"
import { formatTokenAmount } from "@/filters"
import { DashboardState } from "../../types"

import { gatewayModule } from "../../store/gateway"
import AmountInput from "@/components/AmountInput.vue"

@Component({
  components: {
    AmountInput,
  },
})
export default class DepositForm extends Vue {

  @Prop({required: true}) token!: string // prettier-ignore

  setShowDepositForm = gatewayModule.setShowDepositForm
  approveDeposit = gatewayModule.ethereumDeposit

  // vue returns either number or empty string for input number
  transferAmount: number | "" = ""
  amountErrors: string[] = []
  hasErrors: boolean = false
  status: string = ""
  depositAmount: number = 0

  set visible(val) {
    if (val === false) {
      this.setShowDepositForm(false)
      this.status = ""
      this.transferAmount = ""
      this.amountErrors.length = 0
    }
  }

  get visible() {
    return this.showDepositForm
  }

  get userBalance() {
    return parseInt(formatTokenAmount(this.state.ethereum.coins[this.token].balance), 10)
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get showDepositForm() {
    return this.state.gateway.showDepositForm
  }

  errorHandler(val) {
    this.hasErrors = val
  }

  close() {
    this.visible = false
  }

  depositAll() {
    this.transferAmount = Number.parseInt("" + this.userBalance, 10)
  }

  validateAmount() {
    const errors: string[] = []
    const input = this.transferAmount
    if (input === "") {
      return errors.push("Invalid amount")
    }
    const int = Number.parseInt("" + input, 10)
    // TODO: Add validation for decimal values
    // if (int !== input) errors.push("Only round amounts allowed")
    if (int < 1) errors.push("At least 1 loom")
    if (int > this.userBalance) errors.push("Not enough funds in your account")
    this.amountErrors = errors
  }

  async sendApproval(bvModalEvt) {
    this.validateAmount()
    if (this.amountErrors.length) return
    // Prevent modal from closing
    bvModalEvt.preventDefault()
    this.status = "sending"
    try {
      const stringAmount = this.transferAmount.toString()
      const weiAmount = parseToWei(stringAmount)
      const payload = {
        symbol: this.token,
        weiAmount,
      }
      this.approveDeposit(payload).catch((err) => {
        throw new Error(err)
      })
      this.status = "sent"
    } catch (e) {
      this.status = "failed"
      // todo tell the user about it
      console.error(e)
    }
  }

}
</script>