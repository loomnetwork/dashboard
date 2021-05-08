<template>
  <div>
    <b-badge id="network-badge" pill variant="dark">
      {{ genericNetworkName ? genericNetworkName : "Not Connected" }}
      <img v-if="wallet" :src="wallet.logo" class="wallet-logo" :title="wallet.name">
    </b-badge>
    <b-popover v-if="!compact"
      target="network-badge"
      placement="bottom"
      :title="networkName ? `Connected to ${networkName}` : `Waiting to connect...`"
      triggers="hover">
      <div style="min-width: 300px;">
        <div v-if="latestBlock === 0 && account">Fetching latest block...</div>
        <div v-else-if="account">Latest Block: {{ latestBlock }}</div>
        <div v-else>Select a wallet to connect.</div>
      </div>
    </b-popover>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { wallets } from "@/store/ethereum"

@Component
export default class NetworkChip extends Vue {
  @Prop({ default: false })
  readonly compact!: boolean

  get state(): DashboardState {
    return this.$store.state
  }

  get genericNetworkName() {
    return this.account ? this.state.ethereum.genericNetworkName : ""
  }

  get networkName() {
    return this.account ? this.state.ethereum.networkName : ""
  }

  get account() {
    return this.state.ethereum.address
  }

  get latestBlock(): number {
    return this.state.ethereum.blockNumber
  }

  get wallet() {
    return wallets.get(this.state.ethereum.walletType)
  }
}
</script>

<style lang="scss" scoped>
#network-badge {
  font-size: 1rem;
  font-weight: 500;
  color: white;
  padding-left: 1em ;
}
.wallet-logo {
  height: 24px;
  margin: 0 0 0 4px;
  display: inline-block;
}
</style>
