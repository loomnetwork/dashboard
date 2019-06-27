<template>
  <b-modal lazy id="withdraw-confirmed" v-model="visible" :title="title">
    <section v-if="status === 'default'">
      <b-container fluid>
        <div class="lead">
          <p>{{$t("components.modals.confirm_withdrawal_modal.confirm_withdrawl", {amount, token: this.symbol})}}</p>
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
import BN from "bn.js"
import { Component, Watch } from "vue-property-decorator"
import { DashboardState } from "../../types"
import { gatewayModule } from "@/store/gateway"
import { feedbackModule } from "../../feedback/store"
import { IWithdrawalReceipt } from 'loom-js/dist/contracts/transfer-gateway';
import { tokenService } from '../../services/TokenService';
import { formatTokenAmount } from '../../filters';

@Component
export default class WithdrawConfirmed extends Vue {

  status = "default"
  symbol = ""
  setShowDepositConfirmed = gatewayModule.setShowDepositConfirmed
  setWithdrawalReceipts = gatewayModule.setWithdrawalReceipts
  completeWithdrawal = gatewayModule.ethereumWithdraw
  showSuccess = feedbackModule.showSuccess
  showError = feedbackModule.showError
  setShowLoadingBar = feedbackModule.showLoadingBar

  completeWithdrawalHandler() {
    // if (!this.receipt) {
    //   console.log("No receipt found")
    //   this.status = "error"
    //   return
    // }
    // const tokenAddress = this.state.gateway.withdrawalReceipts!.tokenContract
    // const symbol = getTokenSymbolFromAddress(tokenAddress)
    this.completeWithdrawal(this.symbol).then(() => {
      this.showSuccess("Withdrawal complete!")
    }).catch((err) => {
      console.log(err)
      this.setShowLoadingBar(false)
      this.showError("Withdrawal failed, please try again")
      this.status = "error"
    })
    this.close()
  }

  get receipt(): IWithdrawalReceipt | null {
    return this.state.gateway.withdrawalReceipts
  }

  get amount(): BN | undefined | "" {
    if (!this.receipt) return ""
    // @ts-ignore
    return formatTokenAmount(this.receipt.tokenAmount)
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get title(): string {
    return status === "error" ? "Withdrawal failed" : "Withdraw to gateway confirmed"
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

  @Watch("receipt")
  setTokenSymbol(receipt: IWithdrawalReceipt) {
    if (receipt === null) return

    const contractAddress = receipt.tokenContract.local.toString().toLowerCase()
    const tokenInfo = tokenService.tokenFromAddress(contractAddress, "ethereum")
    if (tokenInfo !== null) {
      this.symbol = tokenInfo.symbol
    } else if (contractAddress === this.state.ethereum.contracts.mainGateway.toLowerCase()) {
      this.symbol = "ETH"
    } else {
      console.error("unknown token contract ", contractAddress)
    }
  }

  close() {
    this.setWithdrawalReceipts(null)
  }

}
</script>

