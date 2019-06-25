<template>
  <section class="event deposit" :class="{pending: confirmations < 11 }">
    <h5 class="type">{{ $t("events." + event.type) }}</h5>
    <ul>
      <li v-if="confirmations < 11" class="confirmations">
        <b-spinner variant="primary"></b-spinner>
        {{confirmations}} Confirmations
      </li>
      <li class="block">Block # {{event.blockNumber}}</li>
      <li class="amount">{{event.amount | tokenAmount}} {{event.token}}</li>
    </ul>
    <a class="transaction-hash" :href="etherScanUrl" target="_blank">{{event.transactionHash}}</a>
  </section>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch, Prop } from "vue-property-decorator"
import { EthereumState } from "@/store/ethereum/types"
import { DashboardState } from "@/types"


// ({
//   props: {
//     event: Object,
//   },
// })
@Component
export default class HistoryEvent extends Vue {

  @Prop({ required: true })
  event: any
  etherScanUrl = `${this.state.ethereum.blockExplorer}/tx/${this.event.transactionHash}`

  get state(): DashboardState {
    return this.$store.state
  }

  get ethereum(): EthereumState {
    return this.$store.state.ethereum
  }

  get latestBlock() {
    return this.ethereum.blockNumber
  }

  get confirmations() {
    return this.ethereum.blockNumber - this.event.blockNumber + 1
  }


}
</script>
<style scoped lang="scss">
.event {
  position: relative;
  display: flex;
  max-width: 600px;
  border-left: 5px solid #00bcd4;
  box-shadow: rgba(219, 219, 219, 0.56) -1px 1px 3px 0px;
  margin: 0 0 5px 0;
  height: 100px;
  background: white;

  .type {
    font-size: 1rem;
    padding: 10px;
    &.deposit {
      font-size: 1rem;
      padding: 10px;
    }
  }

  .amount {
    position: absolute;
    top: 40px;
    left: 10px;
  }

  &.deposit .type {
    color: #00bcd4;
  }
}
ul {
  list-style: none;
}
.block {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
}
.transaction-hash {
  font-size: 9px;
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-family: Monaco;
  max-width: 475px;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  @media (min-width: 529px) {
    & {
      font-size: 12px;
    }
  }
}
.confirmations {
  position: absolute;
  top: 40px;
  right: 10px;
  .spinner-border {
    height: 16px;
    width: 16px;
  }
}
</style>
