<template>
  <b-modal lazy id="withdraw-confirmed" v-model="visible" :title="title" no-close-on-esc no-close-on-backdrop hide-header-close >
    <section v-if="status === 'default'">
      <b-container fluid>
        <div v-if="chain !== 'binance'" class="lead">
          <p>{{
            $t('components.gateway.confirm_withdrawal_modal.confirm_withdrawl', 
              { chain: state.ethereum.genericNetworkName, amount, token: this.symbol })
          }}</p>
        </div>
        <div v-else>
           <p>Fund withdrawn to Binance</p>
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
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { TransferGatewayTxStatus } from "loom-js/dist/proto/transfer_gateway_pb"
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
    } else {
      // retry withdraw for binance
      // TODO:  we force to resubmit on binance chain if it isn't Ethereum
      //        need to fix this if we integrate with other chain
      gatewayModule.binanceResubmitWithdrawal()
    }
    this.close()
  }

  get receipt(): IWithdrawalReceipt | null {
    return this.state.gateway.withdrawalReceipts
  }

  get amount(): BN | undefined | "" {
    if (!this.receipt) return ""
    try {
      // @ts-ignore
      return formatTokenAmount(this.receipt.tokenAmount, tokenService.getTokenbySymbol(this.symbol).decimals)
    } catch (err) {
      console.error(err)
    }

  }

  get state(): DashboardState {
    return this.$store.state
  }

  get title() {
    return status === "error" ? this.$t("components.gateway.confirm_withdrawal_modal.status_failed")
      : this.$t("components.gateway.confirm_withdrawal_modal.status_confirmed")
  }

  get visible() {
    if (this.state.gateway.withdrawalReceipts !== null) {
      if (this.chain === "binance") {
        return this.state.gateway.withdrawalReceipts.txStatus === TransferGatewayTxStatus.REJECTED
      } else {
        return true
      }
    }
    return false
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
    if (this.chain === "binance" && receipt.txStatus !== TransferGatewayTxStatus.REJECTED) return

    const chainId = receipt.tokenContract!.chainId
    const chainMappings = {
      binance: "binance",
      eth: "ethereum",
      tron: "tron",
    }
    const chain = chainMappings[chainId]
    const contractAddress = receipt.tokenContract!.local
    const contractAddrStr = contractAddress.toString().toLowerCase()

    let tokenInfo
    if (chain === "binance") {
      this.chain = "binance"
      return
    } else {
      try {
        tokenInfo = tokenService.tokenFromAddress(contractAddrStr, chain)
      } catch (err) {
        console.error(err)
      }
    }

    if (tokenInfo) {
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

