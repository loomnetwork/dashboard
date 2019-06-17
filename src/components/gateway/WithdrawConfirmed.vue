<template>
  <b-modal lazy id="withdraw-confirmed" v-model="visible" title="Withdraw to gateway confirmed">
    <section v-if="status === 'default'">
      <b-container fluid>
        <div class="lead">
          <p>You have a pending withdrawal receipt, please click below to finish your withdrawal.</p>
        </div>
      </b-container>
    </section>
    <section v-if="status === 'error'">
      <b-container fluid>
        <div class="lead">
          <p>An error occurred, please try again.</p>
        </div>
      </b-container>
    </section>
    <template slot="modal-footer" v-if="status === 'default'">
      <b-btn @click="completeWithdrawalHandler" variant="primary">Complete withdraw</b-btn>
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "../../types"
import { gatewayModule } from "@/store/gateway"
import { feedbackModule } from "../../feedback/store"

@Component
export default class WithdrawConfirmed extends Vue {

  status = "default"
  setShowDepositConfirmed = gatewayModule.setShowDepositConfirmed
  setWithdrawalReceipts = gatewayModule.setWithdrawalReceipts
  completeWithdrawal = gatewayModule.ethereumWithdraw
  showSuccess = feedbackModule.showSuccess
  showError = feedbackModule.showError

  completeWithdrawalHandler() {
    const symbol = "LOOM" // TODO: Load symbol from receipt
    // const tokenAddress = this.state.gateway.withdrawalReceipts!.tokenContract
    // const symbol = getTokenSymbolFromAddress(tokenAddress)
    this.completeWithdrawal(symbol).then(() => {
      this.showSuccess("Withdrawal complete!")
    }).catch((err) => {
      console.log(err)
      this.showError("Withdrawal failed, please try again")
      this.status = "error"
    })
    this.close()
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get visible() {
    return this.state.gateway.withdrawalReceipts !== null
  }

  set visible(value) {
    if (value === false) {
      this.status = "default"
      this.$root.$emit("refreshBalances")
    }
  }

  close() {
    this.setWithdrawalReceipts(null)
  }

}
</script>

