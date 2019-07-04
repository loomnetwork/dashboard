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
        :round="false"
        v-model="weiAmount"
        @isError="errorHandler"
      />
    </div>
    <div v-if="token === 'BNB'" class="mt-3">
      <h6>Recepient</h6>
      <h6>Your address on Binance chain (DEX)</h6>
      <input-address
        v-model="recepient"
        chain="binance"
        :blacklist="[ownAddress]"
        :placeholder="'Binance (DEX) address'"
        @isValid="isValidAddressFormat"
      />
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
import bech32 from "bech32"
import { Component, Prop } from "vue-property-decorator"
import { ethers } from "ethers"

import { formatTokenAmount } from "@/filters"
import { formatToCrypto, formatToLoomAddress } from "@/utils"
import { DashboardState, Funds } from "../../types"
import { gatewayModule } from "../../store/gateway"
import { gatewayReactions } from "../../store/gateway/reactions"

import AmountInput from "@/components/AmountInput.vue"
import InputAddress from "../InputAddress.vue"
import { plasmaWithdraw } from "../../store/gateway/plasma"
import { setShowWithdrawProgress } from "../../store/gateway/mutations"
import { LocalAddress, Address, CryptoUtils } from 'loom-js';
import { AddressInfo } from 'net';

@Component({
  components: {
    AmountInput,
    InputAddress,
  },
})

export default class WithdrawForm extends Vue {

  @Prop({ required: true }) token!: string // prettier-ignore

  weiAmount: BN = new BN(0)
  min = new BN(1)
  amountIsValid: boolean = false
  isValidAddress: Address | null = null
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

  get ownAddress() {
    return formatToLoomAddress(this.state.plasma.address.toLowerCase())
  }

  get transferRequest() {
    return this.state.gateway.transferRequest
  }

  get visible() {
    return this.transferRequest.type === "WITHDRAW"
      && this.transferRequest.token !== ""
      && (this.transferRequest.chain === "ethereum"
      || this.transferRequest.chain === "binance")
  }

  set visible(value) {
    if (value === false) {
      gatewayModule.clearTransferRequest()
    }
  }

  isValidAddressFormat(isValid) {
    return this.isValidAddress = isValid
  }

  close() {
    this.visible = false
  }

  errorHandler(isValid: boolean) {
    this.amountIsValid = isValid
  }

  decodeAddress(value) {
    const decodeAddress = bech32.decode(value)
    return Buffer.from(bech32.fromWords(decodeAddress.words))
  }

  async requestWithdrawHandler(e) {
    e.preventDefault()

    // TODO: Cache transactions
    // const txObj = this.state.gateway.pendingTransactions[0]
    let address = new Address("", new LocalAddress(new Uint8Array()))
    if (this.isValidAddress && this.recepient) {
      const tmp = this.decodeAddress(this.recepient)
      address = new Address("binance", new LocalAddress(tmp))
    }
    const payload: Funds = {
      chain: this.transferRequest.chain,
      symbol: this.transferRequest.token,
      weiAmount: this.weiAmount,
      recepient: address,
    }

    this.beginWithdrawal(payload)
    this.close()
  }
}
</script>
