<template>
  <b-modal
    v-model="visible"
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    id="deposit-approval-success"
    title="Withdraw"
  >
    <div v-if="status === 'default'">
      <h6>Token type: {{ token }}</h6>
      <h6>Your token balance: {{ userBalance | formatTokenAmount}} {{ token }}</h6>      
      <amount-input :min="toWei('1')" :max="toWei('100')" :symbol="token" v-model="amount" @isError="errorHandler"/>
    </div>
    <div v-if="status === 'error'">
      <h2>An error occurred, please try again!</h2>
    </div>
    <template slot="modal-footer">
      <div v-if="status === 'default'">
        <b-btn @click="close()">Cancel</b-btn>
        <span style="flex:1"></span>
        <b-btn @click="requestWithdrawHandler" variant="primary" :disabled="amountIsValid">Withdraw</b-btn>
      </div>
      <div v-else>
        <span style="flex:1"></span>
        <b-btn @click="close()">Close</b-btn>
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import BN from "bn.js"
import { Component, Prop } from "vue-property-decorator"
import { ethers } from "ethers"

import { formatTokenAmount } from "@/filters"
import { formatToCrypto, parseToWei } from "@/utils"
import { DashboardState, Funds } from "../../types"
import { gatewayModule } from "../../store/gateway"
import { gatewayReactions } from "../../store/gateway/reactions"

import AmountInput from "@/components/AmountInput.vue"
import { plasmaWithdraw } from "../../store/gateway/plasma"
import { setShowWithdrawProgress } from "../../store/gateway/mutations"

@Component({
  components: {
    AmountInput,
  },
})

export default class WithdrawForm extends Vue {

  @Prop({ required: true }) token!: string // prettier-ignore

  status: string = "default"
  amount: any = 0
  amountIsValid: boolean = false

  setShowWithdrawForm = gatewayModule.setShowWithdrawForm
  setShowWithdrawProgress = gatewayModule.setShowWithdrawProgress
  beginWithdrawal = gatewayModule.plasmaWithdraw

  get state(): DashboardState {
    return this.$store.state
  }

  get userBalance() {
    return parseInt(formatTokenAmount(this.state.ethereum.coins[this.token].balance), 10) + ""
  }

  get visible() {
    return this.state.gateway.showWithdrawForm
  }

  set visible(value) {
    if (value === false) {
      this.setShowWithdrawForm(false)
    }
  }

  close() {
    this.visible = false
  }

  errorHandler(isValid: boolean) {
    this.amountIsValid = isValid
  }

  async requestWithdrawHandler(e) {
    e.preventDefault()

    // TODO: Cache transactions
    // const txObj = this.state.gateway.pendingTransactions[0]
    const payload: Funds = {
      chain: "ethereum",
      symbol: this.token,
      weiAmount: this.amount,
    }

    this.beginWithdrawal(payload).then(() => {
      this.setShowWithdrawProgress(false)
    }).catch((err) => {
      console.log(err)
      this.setShowWithdrawProgress(false)
      this.setShowWithdrawForm(true)
      this.status = "error"
    })
    this.close()
    this.setShowWithdrawProgress(true)
  }

  toWei(val: string) {
    return parseToWei(val)
  }
}
</script>
