<template>
  <b-modal
    v-model="visible"
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    id="deposit-approval-success"
    :title="'Withdraw ' + token"
  >
    <div>
      <h6>Token type: {{ token }}</h6>
      <h6>Your token balance: {{ userBalance | tokenAmount}} {{ token }}</h6>
      <amount-input
        :min="min"
        :max="userBalance"
        :symbol="token"
        v-model="weiAmount"
        @isError="errorHandler"
      />
    </div>
    <div v-if="token === 'BNB'">
      <h6>Recepient</h6>
      <h6>Your address on Binance chain (DEX)</h6>
      <input type="text" v-model="recepient">
    </div>
    <template slot="modal-footer">
      <b-btn @click="close()">Cancel</b-btn>
      <span style="flex:1"></span>
      <b-btn
        class="ml-2"
        @click="requestWithdrawHandler"
        variant="primary"
        :disabled="amountIsValid"
      >Withdraw</b-btn>
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import BN from "bn.js"
import { Component, Prop } from "vue-property-decorator"
import { ethers } from "ethers"

import { formatTokenAmount } from "@/filters"
import { formatToCrypto } from "@/utils"
import { DashboardState, Funds } from "../../types"
import { gatewayModule } from "../../store/gateway"
import { gatewayReactions } from "../../store/gateway/reactions"

import AmountInput from "@/components/AmountInput.vue"
import { plasmaWithdraw } from "../../store/gateway/plasma"
import { setShowWithdrawProgress } from "../../store/gateway/mutations"
import { LocalAddress, Address } from 'loom-js';

@Component({
  components: {
    AmountInput,
  },
})

export default class WithdrawForm extends Vue {

  @Prop({ required: true }) token!: string // prettier-ignore

  weiAmount: BN = new BN(0)
  min = new BN(1)
  amountIsValid: boolean = false
  recepient = ""

  setShowWithdrawForm = gatewayModule.setShowWithdrawForm
  setShowWithdrawProgress = gatewayModule.setShowWithdrawProgress
  beginWithdrawal = gatewayModule.plasmaWithdraw

  get state(): DashboardState {
    return this.$store.state
  }

  get userBalance() {
    return this.state.plasma.coins[this.token].balance
  }

  get transferRequest() {
    return this.state.gateway.transferRequest
  }

  get visible() {
    return this.transferRequest.type === "WITHDRAW"
      && this.transferRequest.token !== ""
      && this.transferRequest.chain === "ethereum"
  }

  set visible(value) {
    if (value === false) {
      gatewayModule.clearTransferRequest()
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
    const recepientAddr = new Address("binance", LocalAddress.fromHexString(this.recepient))

    const payload: Funds = {
      chain: "ethereum",
      symbol: this.transferRequest.token,
      weiAmount: this.weiAmount,
      recepient: recepientAddr,
    }

    this.beginWithdrawal(payload)
    this.close()
  }
}
</script>
