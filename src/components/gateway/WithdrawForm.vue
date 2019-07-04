<template>
  <b-modal
    v-model="visible"
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    id="deposit-approval-success"
    :title="'Withdraw ' + token"
  >
    <div v-if="fee.amount">
      <p>Transfer to {{transferRequest.chain}} requires a fee of {{fee.amount|tokenAmount(fee.decimals)}}</p>
    </div>
    <div>
      <h6>Your balance: {{ userBalance | tokenAmount(tokenInfo.decimals)}} {{ token }}</h6>
      <amount-input
        :min="min"
        :max="userBalance"
        :symbol="transferRequest.token"
        :decimals="tokenInfo.decimals"
        :round="false"
        v-model="weiAmount"
        @isError="errorHandler"
      />
    </div>
    <div v-if="transferRequest.chain === 'binance'" class="mt-3">
      <h6>Recepient on {{transferRequest.chain}}</h6>
      <input-address
        v-model="recepient"
        :chain="transferRequest.chain"
        :placeholder="transferRequest.chain + ' address'"
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
import { Component, Prop, Watch } from "vue-property-decorator"
import { ethers } from "ethers"

import { formatTokenAmount } from "@/filters"
import { formatToCrypto, formatToLoomAddress } from "@/utils"
import { DashboardState, Funds } from "@/types"
import { gatewayModule } from "@/store/gateway"
import { gatewayReactions } from "@/store/gateway/reactions"

import AmountInput from "@/components/AmountInput.vue"
import InputAddress from "../InputAddress.vue"
import { setShowWithdrawProgress } from "@/store/gateway/mutations"
import { LocalAddress, Address } from "loom-js"

import * as plasmaGateways from "@/store/gateway/plasma"
import { tokenService, TokenData } from "@/services/TokenService"

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

  tokenInfo!: TokenData

  // Avoid null bindings by having a NO_FEE value
  fee: { token: string, amount: BN, decimals: number } | {} = {}

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
    const { type, token, chain } = this.transferRequest
    return type === "WITHDRAW"
      && token !== ""
      && (chain === "ethereum" || chain === "binance")
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

  @Watch("visible")
  refreshData(visible: boolean) {
    if (!visible) return
    const { chain, token } = this.transferRequest
    const fee = plasmaGateways.service().get(chain, token).fee
    if (fee) {
      const { decimals } = tokenService.getTokenbySymbol(token)
      this.fee = { ...fee, decimals }
    } else {
      this.fee = {}
    }
    this.tokenInfo = tokenService.getTokenbySymbol(this.transferRequest.token)

  }

  async requestWithdrawHandler(e) {
    e.preventDefault()

    const targetChainId = this.transferRequest.chain === "ethereum" ? "eth" : "binance"
    let recepient
    if (this.isValidAddress && this.recepient) {
      const tmp = this.decodeAddress(this.recepient)
      recepient = new Address(targetChainId, new LocalAddress(tmp))
    }
    const payload: Funds = {
      chain: this.transferRequest.chain,
      symbol: this.transferRequest.token,
      weiAmount: this.weiAmount,
      recepient,
    }

    gatewayModule.plasmaWithdraw(payload)
    this.close()
  }
}
</script>
