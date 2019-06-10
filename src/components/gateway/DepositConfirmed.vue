<template>
  <b-modal lazy id="deposit-confirmed" v-model="visible" title="Deposit to gateway confirmed" 
    ok-only
    >
    <b-container fluid>
      <div class="lead">
        <p>{{ $t('components.gateway.deposit.confirmed') }}</p>
        <router-link to="history" @click.native="close">{{ $t('components.gateway.deposit.view_confirmation') }}</router-link>
      </div>
    </b-container>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "../../types"
import { gatewayModule } from "../../store/gateway"

@Component
export default class DepositConfirmed extends Vue {

  setShowDepositConfirmed = gatewayModule.setShowDepositConfirmed

  get state(): DashboardState {
    return this.$store.state
  }

  get visible() {
    return this.state.gateway.showDepositConfirmed
  }

  set visible(value) {
    if (value === false) {
      this.setShowDepositConfirmed(false)
      this.$root.$emit("refreshBalances")
    }
  }

  close() {
    // just empty the state
    this.$root.$emit("refreshBalances")
    this.visible = false
  }

}
</script>

