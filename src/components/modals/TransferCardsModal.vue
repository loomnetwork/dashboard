<template>
  <b-modal id="transfer-cards-modal" ref="modalRef" title="Transfer Cards" hide-footer centered>
    <b-container fluid>
      <h6> Card ID: {{cardToTransfer.id}} </h6>
       <h6> Name: {{cardToTransfer.display_name}} </h6>
       <h6> Variation: {{cardToTransfer.variation}} </h6>
       <h6> Amount: {{cardToTransfer.amount}} </h6>
      <!-- <b-input type="number" v-model="amountToTransfer"></b-input> -->
      <!-- <b-input type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input> -->

    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"

@Component
export default class TransferCardsModal extends Vue {
  get state(): DashboardState {
    return this.$store.state
  }

  get cardToTransfer() {
    return this.state.plasma.cardToTransferSelected
  }
}
</script>
<style lang="scss">

</style>
