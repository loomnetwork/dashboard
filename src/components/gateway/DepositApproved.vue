<template>
  <b-modal
    v-model="visible"
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
    </b-container>
    <b-container fluid v-else-if="status === 'failed'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.failure') }}</p>
      </div>
    </b-container>
    <template slot="modal-footer">
      <div v-if="status === 'notify'">
        <b-btn @click="close()" class="mr-2">Cancel</b-btn>
        <span style="flex:1"></span>
        <b-btn @click="completeDeposit" variant="primary">Complete deposit</b-btn>
      </div>
      <div v-else-if="status === 'sending'"></div>
      <div v-else>
        <span style="flex:1"></span>
        <b-btn @click="close">Close</b-btn>
      </div>
    </template>    
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { ethers } from "ethers"

import { DashboardState } from "@/types"
import { gatewayModule } from "@/store/gateway"
import { gatewayReactions } from "@/store/gateway/reactions"

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
  setShowDepositConfirmed = gatewayModule.setShowDepositConfirmed
  executeDeposit = gatewayModule.ethereumDeposit

  get visible() {
    console.log("showDepositApproved", this.showDepositApproved)
    return this.showDepositApproved
  }

  set visible(value) {
    if (value === false) {
      this.setShowDepositApproved(false)
      this.status = "notify"
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
      this.executeDeposit(txObj.funds).catch((err) => {
        throw Error(err)
      }).then(() => {
        this.close()
        this.setShowDepositConfirmed(true)
      })
      this.status = "sent"
    } catch (error) {
      console.log(error)
      this.status = "failed"
    }
  }

}
</script>