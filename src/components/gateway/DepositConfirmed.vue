<template>
  <b-modal lazy id="deposit-confirmed" v-model="visible" title="Deposit to gateway confirmed" 
    ok-only
    >
    <b-container fluid>
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.success') }}</p>
        <router-link to="history">view confirmations</router-link>
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
export default class DepositConfirmed extends Vue {

  @dposModule.State("showDepositConfirmed")
  showDepositConfirmed:boolean

  @dposModule.Mutation("setShowDepositConfirmed")
  setShowDepositConfirmed:Function

  get visible() {
    console.log("showDepositConfirmed",this.showDepositConfirmed)
    return  this.showDepositConfirmed
  }

  set visible(value) {
    if (value === false) {
     this.setShowDepositConfirmed(false)
    }
  }

  close() {
    // just empty the state
    this.visible = false
  }

}
</script>

