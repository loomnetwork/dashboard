<template>
  <div>
    <b-badge id="network-badge" pill variant="dark">
      {{ genericNetworkName }}
    </b-badge>
    <b-popover v-if="!compact"
      target="network-badge"
      placement="bottom"
      :title="`Connected to ${networkName}`"
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
import { Component, Vue, Prop } from "vue-property-decorator";
import { DashboardState } from "@/types";

@Component
export default class NetworkChip extends Vue {
  @Prop({ default: false })
  readonly compact!: boolean;

  get state(): DashboardState {
    return this.$store.state
  }

  get genericNetworkName() {
    return this.account ? this.state.ethereum.genericNetworkName : "Not Connected"
  }

  get networkName() {
    return this.account ? this.state.ethereum.networkName : "Waiting to connect..."
  }

  get account() {
    return this.state.ethereum.address
  }

  get latestBlock(): number {
    return this.state.ethereum.blockNumber
  }
}
</script>

<style lang="scss" scoped>
#network-badge {
  font-size: 1rem;
  font-weight: 500;
  color: white;
}
</style>
