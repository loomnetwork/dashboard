<template>
  <b-modal v-model="visible"
    hide-footer
    no-close-on-backdrop 
    no-close-on-esc
    hide-header-close
    id="deposit-approval-success"  title="Complete deposit" 
    >
    <b-container fluid v-if="state === 'notify'">
      <div class="lead">
        <p>{{ $t('components.gateway.approval.success') }}</p>
      </div>
      <b-btn @click="completeDeposit">Complete deposit</b-btn>
    </b-container>  
    <b-container fluid v-else-if="state === 'sending'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.sending') }}</p>
      </div>
    </b-container> 
    <b-container fluid v-else-if="state === 'sent'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.sent') }}</p>
      </div>
      <b-btn @click="close">Close</b-btn>
    </b-container>  
    <b-container fluid v-else-if="state === 'failed'">
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.failure') }}</p>
      </div>
      <b-btn @click="close">Close</b-btn>
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

  state:string = 'notify'

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
     this.state = 'notify'
    }
  }

  close() {
    this.visible = false
  }

  async completeDeposit(e) {
    this.state = 'sending'
    e.preventDefault()
    try {
      await this.executeDeposit()
      this.state = 'sent'
    } catch (error) {
      console.log(error)
      this.state = 'failed'
    }
  }

}
</script>