<template>
  <b-modal
    lazy
    id="deposit-form"
    title="BootstrapVue"
    v-model="visible"
    :busy="true"
    no-close-on-esc
    no-close-on-backdrop
    hide-header-close
  >
    <template slot="modal-title">Deposit {{ token }}</template>
    <div v-if="!status">
      <form>
        <h6>Token type: {{ token }}</h6>
        <h6>Your token balance: {{ userBalance | tokenAmount}} {{ token }}</h6>
        <amount-input
          :min="min"
          :max="userBalance"
          v-model="transferAmount"
          :symbol="token"
          @isError="errorHandler"
        />
        <div class="error" v-for="e in amountErrors" :key="e">- {{e}}</div>
      </form>
    </div>
    <div v-else-if="status === 'sending'">
      <p class="lead">{{ $t("components.gateway.approval.sending") }}</p>
    </div>
    <div v-else-if="status === 'failed'">
      <p class="lead">{{ $t("components.gateway.approval.failure") }}</p>
    </div>
    <div v-else-if="status === 'sent'">
      <p class="lead">{{ $t("components.gateway.approval.sent") }}</p>
    </div>
    <template slot="modal-footer">
      <div v-if="!status">
        <b-btn @click="close()" class="mr-2">Cancel</b-btn>
        <span style="flex:1"></span>
        <b-btn @click="sendApproval" variant="primary" :disabled="hasErrors">Confirm</b-btn>
      </div>
      <div v-else>
        <span style="flex:1"></span>
        <b-btn @click="close">Close</b-btn>
      </div>
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

import { Funds } from "@/types"

import { gatewayModule } from "../../store/gateway"
import AmountInput from "@/components/AmountInput.vue"
import { gatewayReactions } from "../../store/gateway/reactions"

@Component({
  components: {
    AmountInput,
  },
})
export default class DepositForm extends Vue {

  @Prop({ required: true }) token!: string // prettier-ignore

  setShowDepositForm = gatewayModule.setShowDepositForm
  setShowDepositApproved = gatewayModule.setShowDepositApproved
  approveDeposit = gatewayModule.ethereumDeposit

  // vue returns either number or empty string for input number
  min = new BN(1)
  transferAmount: BN | "" = ""
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
      gatewayModule.clearTransferRequest()
    }
  }

  get visible() {
    return this.transferRequest.type === "DEPOSIT"
      && this.transferRequest.token
      && this.transferRequest.chain === "ethereum"
  }

  get userBalance(): BN {
    return this.state.ethereum.coins[this.token].balance
  }

  get transferRequest() {
    return this.state.gateway.transferRequest
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

  async sendApproval(bvModalEvt) {
    if (this.transferAmount === "") return
    if (this.hasErrors) return

    // Prevent modal from closing
    bvModalEvt.preventDefault()
    const payload: Funds = {
      chain: "ethereum",
      symbol: this.token,
      weiAmount: this.transferAmount,
    }

    this.approveDeposit(payload)
    this.close()
  }
}
</script>
