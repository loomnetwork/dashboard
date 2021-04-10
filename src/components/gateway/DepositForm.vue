<template>
  <b-modal
    lazy
    id="deposit-form"
    title="BootstrapVue"
    v-model="visible"
    v-if="visible"
    :busy="true"
    no-close-on-esc
    no-close-on-backdrop
    hide-header-close
  >
    <template slot="modal-title">
      {{ $t('components.gateway.deposit_form.title', { token: token, chain: sourceNetworkName }) }}
    </template>
    <div v-if="!status">
      <form>
        <h6
          v-if="allowance !== ZERO"
        >{{ $t('components.gateway.deposit_form.amount_approved') }} {{allowance | tokenAmount(state.plasma.coins[token].decimals)}} {{ token }}</h6>
        <h6>{{ $t('components.gateway.deposit_form.balance') }} {{ userBalance | tokenAmount(state.plasma.coins[token].decimals)}} {{ token }}</h6>
        <amount-input
          :min="min"
          :max="userBalance"
          v-model="transferAmount"
          :round="false"
          :symbol="token"
          @isError="errorHandler"
          :decimals="state.plasma.coins[token].decimals"
        />
        <div class="error" v-for="e in amountErrors" :key="e">- {{e}}</div>
      </form>
    </div>
    <div v-else-if="status === 'sending'">
      <p class="lead">{{ $t('components.gateway.approval.sending') }}</p>
    </div>
    <div v-else-if="status === 'failed'">
      <p class="lead">{{ $t('components.gateway.approval.failure') }}</p>
    </div>
    <div v-else-if="status === 'sent'">
      <p class="lead">{{ $t('components.gateway.approval.sent') }}</p>
    </div>
    <template slot="modal-footer">
      <div v-if="!status">
        <b-btn @click="close()" class="mr-2">Cancel</b-btn>
        <span style="flex:1"></span>
        <b-btn @click="sendApproval" variant="primary" :disabled="hasErrors">{{ $t("button.confirm") }}</b-btn>
      </div>
      <div v-else>
        <span style="flex:1"></span>
        <b-btn @click="close">{{ $t("button.close") }}</b-btn>
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import BN from "bn.js"
import { ZERO } from "@/utils"
import { DashboardState } from "@/types"

import { Funds } from "@/types"

import { gatewayModule } from "@/store/gateway"
import AmountInput from "@/components/AmountInput.vue"
import { ethereumModule } from "@/store/ethereum"

@Component({
  components: {
    AmountInput,
  },
})
export default class DepositForm extends Vue {

  ZERO = ZERO

  @Prop({ required: true }) token!: string // prettier-ignore

  setShowDepositForm = gatewayModule.setShowDepositForm

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
    return this.state.ethereum.coins[this.transferRequest.token].balance
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

  get allowance(): BN {
    const symbol = this.transferRequest.token
    if ("ETH" === symbol) {
      return ZERO
    } else {
      const allowance = this.state.gateway.ethereumAllowances.find((a) => a.token.symbol === symbol)
      return allowance ? allowance.amount : ZERO
    }
  }

  get sourceNetworkName() {
    if (this.transferRequest.chain === "binance") {
      return "Binance Chain"
    } else { // transferRequest.chain === "ethereum" could be either Ethereum or BSC
      return this.state.ethereum.genericNetworkName
    }
  }

  errorHandler(val) {
    this.hasErrors = val
  }

  close() {
    this.visible = false
  }

  @Watch("visible")
  refreshBalance(show: boolean) {
    if (show) {
      ethereumModule.refreshBalance(this.transferRequest.token)

      if (this.allowance !== ZERO) {
        this.transferAmount = this.allowance
      }
    }
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
    gatewayModule.ethereumDeposit(payload)

    this.close()
  }
}
</script>
