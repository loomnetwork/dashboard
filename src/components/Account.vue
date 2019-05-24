<template>
  <b-card class="mb-5">
    <b-card-title>My Account</b-card-title>
    <b-row>
      <b-col cols="3">Ethereum:</b-col>
      <b-col cols="6"><h6 class="highlight">{{ethAccount}}</h6></b-col>
      <b-col cols="3"><a :href="gotoEtherScan"  target="_blank">Show in EtherScan <fa icon="external-link-alt"/></a></b-col>
    </b-row>
    <b-row>
      <b-col cols="3">Loom:</b-col>
      <b-col cols="6"><h6 class="highlight">{{dappchainAddress | loomAddress}}</h6></b-col>
      <b-col cols="3"><a :href="gotoBlockExplorer" target="_blank">Show in Block Explorer <fa icon="external-link-alt"/></a></b-col>
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
  dposUser: DPOSUserV3 | null = null
  dappchainAddress = ""
  gotoEtherScan = `${this.dposState.currentChain.etherScan}/address/${this.ethAccount}`
  gotoBlockExplorer = `${this.dposState.currentChain.blockExplorer}`
  // gotoEtherScan = `${this.etherScanDomain}/address/${this.ethAccount}`
  // gotoBlockExplorer = `${this.blockExplorerDomain}`

  get state(): DashboardState {
    return this.$store.state
  }

  get dposState(): DposState {
    return this.$store.state.DPOS
  }

  get ethAccount() {
    return this.state.DPOS.currentMetamaskAddress
  }

  async mounted() {
    this.dposUser = await this.state.DPOS.dposUser
    this.dappchainAddress = this.dposUser!.loomAddress.local.toString()
  }

}
</script>