<template>
  <b-card class="mb-5">
    <b-card-title>My Account</b-card-title>
    <b-row>
      <b-col cols="3">Ethereum:</b-col>
      <b-col cols="6">
        <h6 class="highlight">{{ethAccount}}</h6>
      </b-col>
      <b-col cols="3">
        <a :href="etherScanUrl" target="_blank">
          Show in EtherScan
          <fa icon="external-link-alt"/>
        </a>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="3">Loom:</b-col>
      <b-col cols="6">
        <h6 class="highlight">{{dappchainAddress | loomAddress}}</h6>
      </b-col>
      <b-col cols="3">
        <a :href="blockExplorerUrl" target="_blank">
          Show in Block Explorer
          <fa icon="external-link-alt"/>
        </a>
      </b-col>
    </b-row>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { dposModule } from "@/store/dpos"
import { DashboardState, DposState } from "@/types"
import { DPOSUserV3 } from "loom-js"
// import configs from "chain-config"

@Component
export default class Account extends Vue {
  etherScanUrl = `${this.dposState.currentChain.etherScan}/address/${this.ethAccount}`
  blockExplorerUrl = `${this.dposState.currentChain.blockExplorer}`

  get state(): DashboardState {
    return this.$store.state
  }

  get dposState(): DposState {
    return this.$store.state.DPOS
  }

  get ethAccount() {
    return this.state.ethereum.address
  }

  get dappchainAddress() {
    return this.state.plasma.address
  }


}
</script>