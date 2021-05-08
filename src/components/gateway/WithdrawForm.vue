<template>
  <b-modal
    v-model="visible"
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    id="deposit-approval-success"
    :title="$t('components.gateway.withdraw_form_modal.title', { token: token, chain: destinationNetworkName })"
  >
    <b-alert v-if="token === 'LOOM' && destinationNetworkName === 'Ethereum'" show variant="warning">
      <strong>WARNING</strong>
      <p>
        Most exchanges only support one version of the LOOM token.
        You are withdrawing <strong>NEW LOOM</strong> tokens, do not send them to an exchange that only
        supports <strong>OLD LOOM</strong> tokens!
      </p>
      <p>
        Sending the <strong>NEW LOOM</strong> tokens to an exchange that doesn't support them yet
        may result in a loss of funds. See our
        <a
          href="https://medium.com/loom-network/loom-token-swap-launch-f9257a4ae066"
          target="_blank"
        >
        token swap launch article</a> for the latest exchange info.
      </p>
    </b-alert>
    <div v-if="visible && tokenInfo">
      <div v-if="fee.amount">
        <p>
          {{ $t('components.gateway.withdraw_form_modal.transfer_fee', { chain: destinationNetworkName }) }}
          {{fee.amount|tokenAmount(fee.decimals)}} {{fee.token}}
        </p>
      </div>
      <div>
        <h6>{{ $t('components.gateway.withdraw_form_modal.balance') }} {{ balance | tokenAmount(tokenInfo.decimals)}} {{ token }}</h6>
        <h6 v-if="isWithdrawalLimitEnabled && isCheckDailyRemainingWithdrawAmount()">
          {{ $t('components.gateway.withdraw_form_modal.daily_remaining_withdraw_amount') }}
          {{ dailyRemainingWithdrawAmount | tokenAmount(tokenInfo.decimals) }} {{ token }}
        </h6>
        <amount-input
          :min="min"
          :max="max"
          :symbol="transferRequest.token"
          :decimals="tokenInfo.decimals"
          :round="false"
          v-model="weiAmount"
          @isError="setAmountIsError"
        />
      </div>
      <div v-if="requireRecipient" class="mt-3">
        <h6>{{ $t('components.gateway.withdraw_form_modal.recipient', { chain: destinationNetworkName }) }}</h6>
        <input-address
          v-model="recepient"
          :chain="transferRequest.chain"
          :placeholder="$t('input_placeholder.chain_addr', { transferChain: destinationNetworkName })"
          @isValid="isValidAddressFormat"
        />
      </div>
    </div>
    <template slot="modal-footer">
      <b-btn @click="close()">Cancel</b-btn>
      <span style="flex:1"></span>
      <b-btn
        class="ml-2"
        @click="requestWithdrawal"
        variant="primary"
        :disabled="validInput === false || max <= 0"
      >{{ $t('components.gateway.withdraw_form_modal.withdraw') }}</b-btn>
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import BN from "bn.js"
import bech32 from "bech32"
import { Component, Prop, Watch } from "vue-property-decorator"

import { ZERO } from "@/utils"
import { DashboardState, Funds } from "@/types"
import { gatewayModule } from "@/store/gateway"

import AmountInput from "@/components/AmountInput.vue"
import InputAddress from "../InputAddress.vue"
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

  weiAmount: BN = ZERO
  min = new BN(1)
  max!: BN
  amountIsValid: boolean = false
  isValidAddress: boolean = false
  recepient = ""
  dailyRemainingWithdrawAmount: BN = ZERO

  tokenInfo: TokenData | null = null

  // Avoid null bindings by having a NO_FEE value
  fee: { token: string, amount: BN, decimals: number } | {} = {}

  get state(): DashboardState {
    return this.$store.state
  }

  get networkId() { return this.$store.state.plasma.networkId }

  get requireRecipient(): boolean {
    return this.transferRequest.chain === "binance"
  }

  get balance() {
    return this.state.plasma.coins[this.token].balance
  }

  get transferRequest() {
    return this.state.gateway.transferRequest
  }

  get destinationNetworkName() {
    if (this.transferRequest.chain === "binance") {
      return "Binance Chain"
    } else { // transferRequest.chain === "ethereum" could be either Ethereum or BSC
      return this.state.ethereum.genericNetworkName
    }
  }

  get isWithdrawalLimitEnabled() {
    return this.state.gateway.withdrawalLimit
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
      this.reset()
    }
  }

  reset() {
    this.amountIsValid = false
    this.isValidAddress = false
    this.weiAmount = ZERO
    this.recepient = ""
  }

  isValidAddressFormat(isValid) {
    return this.isValidAddress = isValid
  }

  isCheckDailyRemainingWithdrawAmount() {
    return this.transferRequest.token === "ETH" || this.transferRequest.token === "LOOM"
  }

  close() {
    this.visible = false
  }

  setAmountIsError(isError: boolean) {
    this.amountIsValid = !isError
  }

  decodeAddress(value) {
    const decodeAddress = bech32.decode(value)
    return Buffer.from(bech32.fromWords(decodeAddress.words))
  }

  get validInput() {
    return this.amountIsValid && (this.requireRecipient === false || this.isValidAddress) && this.balanceCoversFee
  }

  get balanceCoversFee() {
    // @ts-ignore
    if (this.fee.token) {
      // @ts-ignore
      return this.state.plasma.coins[this.fee.token].balance.gte(this.fee.amount)
    }
    return true
  }

  async remainWithdrawAmount() {
    const { chain, token } = this.transferRequest
    const gateway = plasmaGateways.service().get(chain, token)

    const ownerAddress = Address.fromString(`${this.state.plasma.chainId}:${this.state.plasma.address}`)
    const plasmaAccountInfo =  await gateway.getLocalAccountInfo(ownerAddress)
    let totalWithdrawalAmount: BN =  plasmaAccountInfo!.totalWithdrawalAmount

    const lastWithdrawalLimitResetTime: number = plasmaAccountInfo!.lastWithdrawalLimitResetTime
    const lastWithdrawalLimitResetDate: Date = new Date(lastWithdrawalLimitResetTime * 1000)
    const todayDate: Date = new Date()

    // if lastWithdrawalLimitResetDate is not today then set total withdraw amount of this account to 0
    if (lastWithdrawalLimitResetDate.toDateString() !== todayDate.toDateString()) {
      totalWithdrawalAmount = new BN(0)
    }

    const gatewayState = await gateway.getGatewayState()
    const maxPerAccountDailyWithdrawalAmount: BN = gatewayState!.maxPerAccountDailyWithdrawalAmount
    const remainingWithdrawAmount = maxPerAccountDailyWithdrawalAmount.sub(totalWithdrawalAmount)

    console.log("remainingWithdrawAmount: ", remainingWithdrawAmount.toString())
    return remainingWithdrawAmount
  }

  @Watch("visible")
  async refreshData(visible: boolean) {
    if (!visible) return
    const { chain, token } = this.transferRequest
    const fee = plasmaGateways.service().get(chain, token).fee
    if (this.isWithdrawalLimitEnabled && this.isCheckDailyRemainingWithdrawAmount()) {
      this.dailyRemainingWithdrawAmount = await this.remainWithdrawAmount()
      this.max = this.balance.lt(this.dailyRemainingWithdrawAmount) ? this.balance : this.dailyRemainingWithdrawAmount
    } else {
      this.max = this.balance
    }
    if (fee) {
      const { decimals } = tokenService.getTokenbySymbol(fee.token)
      this.fee = { ...fee, decimals }
      if (fee.token === token) {
        this.max = this.balance.sub(fee.amount)
        console.log(this.max.toString(), this.balance.toString(), fee.amount.toString())
      }
    } else {
      this.fee = {}
    }
    this.tokenInfo = tokenService.getTokenbySymbol(this.transferRequest.token)
    if (this.isWithdrawalLimitEnabled) {
      this.dailyRemainingWithdrawAmount = await this.remainWithdrawAmount()
    }
  }

  async requestWithdrawal(e) {
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
