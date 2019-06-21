<template>
  <b-card class="mb-1">
    <ul>
      <li>
        <strong
          class="block-confirmation-msg"
        >Confirmations: {{(latestBlock - event.blockNumber) + 1}}</strong>
      </li>
      <li>Block #: {{event.blockNumber}}</li>
      <li>Amount: {{event.amount | tokenAmount}} {{event.token}}</li>
      <li>Tx Hash: {{event.transactionHash}}</li>
    </ul>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { EthereumState } from "../store/ethereum/types"
@Component({
  props: {
    event: Object,
  },
})
export default class HistoryEvent extends Vue {

  get ethereum(): EthereumState {
    return this.$store.state.ethereum
  }

  get latestBlock() {
    return this.ethereum.blockNumber
  }

  // @Watch("event")
  //   onMappedChange(newValue, oldValue) {
  //   if(newValue) {
  //     this.latestBlock - newValue.item['Block #'] <= 10
  //     this.$emit("keepPolling");
  //   }
  // }

}
</script>
<style scoped lang="scss">
.custom-card-header {
  background-color: #ffffff;
}
.block-confirmation-msg {
  color: #f04e4e;
}
</style>
