<template>
  <b-modal
    v-model="visible"
    hide-footer
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    id="deposit-approval-success"
    title="Complete deposit"
  >
    <b-container fluid v-if="status === 'notify'">
      <div class="lead">
        <p>{{ $t('components.gateway.approval.success') }}</p>
      </div>
      <b-btn @click="completeDeposit">Complete deposit</b-btn>
    </b-container>
    <b-container fluid v-else-if="status === 'sending'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.sending') }}</p>
      </div>
    </b-container>
    <b-container fluid v-else-if="status === 'sent'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.sent') }}</p>
      </div>
      <b-btn @click="close">Close</b-btn>
    </b-container>
    <b-container fluid v-else-if="status === 'failed'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.failure') }}</p>
      </div>
      <b-btn @click="close">{{ $t('Close') }}</b-btn>
    </b-container>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { ethers } from "ethers"

import { DashboardState } from "@/types"
import { gatewayModule } from '@/store/gateway'
import { gatewayReactions } from '@/store/gateway/reactions'

@Component
export default class DepositApproved extends Vue {

  status: string = "notify"

  get state(): DashboardState {
    return this.$store.state
  }

  get transaction() {
    return this.state.gateway.pendingTransactions[0]
  }
  get showDepositApproved() {
    return this.state.gateway.showDepositApproved
  }

  setShowDepositApproved = gatewayModule.setShowDepositApproved
  executeDeposit = gatewayModule.ethereumDeposit

  get visible() {
    return this.showDepositApproved
  }

  set visible(value) {
    if (value === false) {
      this.status = "notify"
      this.setShowDepositApproved(false)
    }
  }

  close() {
    this.visible = false
  }

  async completeDeposit(e) {
    this.status = "sending"
    e.preventDefault()
    try {
      const txObj = this.state.gateway.pendingTransactions[0]
      await this.executeDeposit(txObj.funds)
      this.status = "sent"
    } catch (error) {
      console.log(error)
      this.status = "failed"
    }
  }

}
</script>