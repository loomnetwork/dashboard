<template>
  <b-modal lazy id="withdraw-confirmed" v-model="visible" :title="title">
    <section v-if="status === 'default'">
      <b-container fluid>
        <div class="lead">
          <p>{{$t('components.gateway.confirm_withdrawal_modal.confirm_withdrawl', {chain,amount, token: this.symbol})}}</p>
        </div>
      </b-container>
    </section>
    <section v-if="status === 'error'">
      <b-container fluid>
        <div class="lead">
          <p>{{$t('messages.error_try_again')}}</p>
        </div>
      </b-container>
    </section>
    <template slot="modal-footer" v-if="status === 'default'">
      <b-btn @click="completeWithdrawalHandler" variant="primary">{{$t('components.gateway.confirm_withdrawal_modal.complete')}}</b-btn>
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
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { tokenService } from "../../services/TokenService"
import { formatTokenAmount } from "../../filters"

@Component
export default class WithdrawConfirmed extends Vue {

  status = "default"
  symbol = ""
  chain = ""

  completeWithdrawalHandler() {

    if (this.chain === "ethereum") {
      gatewayModule.ethereumWithdraw(this.symbol)
    } else if (this.chain === "binance") {
      // retry withdraw for binance
      gatewayModule.binanceResubmitWithdrawal()
    } else {
      console.error("complete withdrawal unimplemented for chain" + this.chain)
    }
    this.close()
  }

  get receipt(): IWithdrawalReceipt | null {
    return this.state.gateway.withdrawalReceipts
  }

  get amount(): BN | undefined | "" {
    if (!this.receipt) return ""
    // @ts-ignore
    return formatTokenAmount(this.receipt.tokenAmount, tokenService.getTokenbySymbol(this.symbol).decimals)
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get title() {
    return status === "error" ? this.$t('components.gateway.confirm_withdrawal_modal.status_failed') : this.$t('components.modals.confirm_withdrawal_modal.status_confirmed')
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
    const chainId = receipt.tokenContract.chainId
    const chainMappings = {
      binance: "binance",
      eth: "ethereum",
      tron: "tron",
    }

    const chain = chainMappings[chainId]
    const contractAddress = receipt.tokenContract.local
    const contractAddrStr = contractAddress.toString().toLowerCase()

    let tokenInfo

    if (chain === "binance") {
      // for binance the token symbol is stored in the address
      const symbol = [...contractAddress.bytes.filter((cc) => cc > 0)].map((cc) => String.fromCharCode(cc)).join("")
      tokenInfo = tokenService.getTokenbySymbol(symbol)
    } else {
      tokenInfo = tokenService.tokenFromAddress(contractAddrStr, chain)
    }

    if (tokenInfo !== null) {
      this.symbol = tokenInfo.symbol
      this.chain = chain
    } else if (contractAddrStr === this.state.ethereum.contracts.mainGateway.toLowerCase()) {
      this.symbol = "ETH"
    } else {
      console.error("unknown token contract ", contractAddress)
    }

    this.chain = chain

  }

  close() {
    gatewayModule.setWithdrawalReceipts(null)
  }

}
</script>

