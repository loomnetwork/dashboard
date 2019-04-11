<template>
  <b-modal v-model="visible"
    hide-footer=""
    no-close-on-backdrop 
    no-close-on-esc 
    id="deposit-approval-success"  title="Approval success" 
    >
    <b-container fluid>
      <div class="lead">
        <p>{{ $t('components.gateway.approval.success') }}</p>
        <a href="history">view confirmations</a>
      </div>
      <b-btn @click="completeDeposit">Complete deposit</b-btn>
    </b-container>    
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import {ethers} from "ethers"

import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from 'vuex-class'
import { formatToCrypto } from '@/utils';

const dposModule = namespace('DPOS')

@Component
export default class DepositApproved extends Vue {

  @dposModule.State("pendingTx")
  transaction:any

  @dposModule.State("showDepositApproved")
  showDepositApproved: boolean

  @dposModule.Mutation("setShowDepositApproved")
  setShowDepositApproved:Function

  @dposModule.Action("executeDeposit")
  executeDeposit:Function

  get visible() {
    console.log("showDepositApproved",this.showDepositApproved)
    return this.showDepositApproved
  }

  set visible(value) {
    if (value === false) {
     this.setShowDepositApproved(false)
    }
  }

  async completeDeposit(e) {
    e.preventDefault()
    await this.executeDeposit()
  }

}
</script>