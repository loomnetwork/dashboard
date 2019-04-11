<template>
  <b-modal lazy id="deposit-approval-success" v-model="showDepositApprovalSuccess" title="Approval success" 
    centered no-close-on-backdrop ok-only
    ok-title="Complete deposit"
    @ok="completeDeposit"
    >
    <b-container fluid>
      <div v-if="!status" class="lead">
        {{ $t('components.gateway.approval.success', {tokenAmount}) }}
      </div>
      <div v-else-if="status === 'sending'">
          sending spinner...
      </div>
      <div v-else-if="status === 'sent'" class="lead">
        {{ $t('components.gateway.deposit.pending') }}
      </div>
      <div v-else-if="status === 'failed'" class="error">
        {{ $t('components.gateway.deposit.failure') }}
      </div>
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
export default class SuccessModal extends Vue {

  @dposModule.State("depositApproved")
  depositApproved: ethers.utils.BigNumber

  @dposModule.Getter("showDepositApprovalSuccess")
  showDepositApprovalSuccess:boolean

  @dposModule.Action("executeDeposit")
  executeDeposit:Function

  status:string = ''

  get tokenAmount() {
      return formatToCrypto(this.depositApproved.toString())
  }

  async completeDeposit(bvModalEvt) {
    // Prevent modal from closing
    bvModalEvt.preventDefault()
    this.status = "sending"
    try {
        await this.executeDeposit(this.depositApproved)
        this.status = "sent"
        // emit event maybe
    } catch (e) {
        this.status = "failed"
        // todo tell the user about it
        console.error(e)
    }
  }

}
</script>