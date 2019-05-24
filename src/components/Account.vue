<template>
  <b-card class="mb-5">
    <b-card-title>My Account</b-card-title>
    <b-row>
      <b-col cols="3">Ethereum:</b-col>
      <b-col cols="6"><h6 class="highlight">{{ethAccount}}</h6></b-col>
      <b-col cols="3"><router-link to="gotoEtherScan">Show in EtherScan </router-link></b-col>
    </b-row>
    <b-row>
      <b-col cols="3">Loom:</b-col>
      <b-col cols="6"><h6 class="highlight">{{dappchainAccount | loomAddress}}</h6></b-col>
      <b-col cols="3"><router-link to="gotoBlockExplorer">Show in Block Explorer</router-link></b-col>
    </b-row>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { dposModule } from "@/store/dpos"
import { DashboardState } from "@/types"
import { DPOSUserV3 } from "loom-js"

@Component
export default class Account extends Vue {
  dposUser: DPOSUserV3 | null = null
  dappchainAccount = ""
  etherScanDomain = "https://etherscan.io" // TODO: set to env variable
  blockExplorerDomain = "https://blockexplorer.loomx.io/" // TODO: set to env variable

  get state(): DashboardState {
    return this.$store.state
  }

  get ethAccount() {
    return this.state.DPOS.currentMetamaskAddress
  }

  async mounted() {
    this.dposUser = await this.state.DPOS.dposUser
    this.dappchainAccount = this.dposUser!.loomAddress.local.toString()
  }

  gotoEtherScan() {
    return `${this.etherScanDomain}/address/${this.ethAccount}`
  }

  gotoBlockExplorer() {
    return `${this.blockExplorerDomain}` // TODO: goto specific address
  }
}
</script>