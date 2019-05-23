<template>
  <b-modal id="transfer-cards-modal" ref="modalRef" title="Transfer Cards" hide-footer centered>
    <b-container fluid>
      <h6> Card ID: {{cardToTransfer.id}} </h6>
       <h6> Name: {{cardToTransfer.display_name}} </h6>
       <h6> Variation: {{cardToTransfer.variation}} </h6>
       <h6> Your existing card: {{cardToTransfer.amount}} </h6>
      Amount: (max: {{cardToTransfer.amount}})
      <b-input class="my-2" type="number" v-model="amountToTransfer" :max="cardToTransfer.amount" :min="1"></b-input> 
      Receiver Loom Address:
      <b-input class="my-2" type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input>
       <b-form-checkbox class="my-2"
        id="confirmCard"
        v-model="confirmCard"
        name="confirmCard"
        v-show="amountToTransfer && receiverAddress">
        I confirm to transfer {{amountToTransfer}} cards to {{receiverAddress}} address.
      </b-form-checkbox>
      <b-button class="my-2" type="button" @click="transferCardsHandler()" 
      :disabled=" !receiverAddress || !amountToTransfer || amountToTransfer > parseInt(cardToTransfer.amount) || amountToTransfer < 1 || !confirmCard">Transfer</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { plasmaModule } from '@/store/plasma';
import { CommonTypedStore } from "@/store/common"
import { DPOSTypedStore } from '@/store/dpos-old';

@Component
export default class TransferCardsModal extends Vue {
  amountToTransfer: number = 1
  receiverAddress: string = ""
  transferCards = plasmaModule.transferCards
  setErrorMsg = CommonTypedStore.setErrorMsg
  confirmCard = false

  mounted() {
    this.amountToTransfer = 1
    this.receiverAddress = ""
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get cardToTransfer() {
    return this.state.plasma.cardToTransferSelected
  }

  transferCardsHandler() {
    if (this.amountToTransfer > parseInt(this.cardToTransfer.amount) || this.amountToTransfer%1 !== 0) {
      this.setErrorMsg("Invalid amount")
      return
    }
    if (this.receiverAddress === "") {
      this.setErrorMsg("Invalid receiver address")
      return
    }
    // TODO: put confirmation popup here
    this.transferCards({
      cardIds: [this.cardToTransfer.id],
      amounts: [this.amountToTransfer],
      destinationDappchainAddress: this.receiverAddress
    })
    this.$root.$emit("bv::hide::modal", "transfer-cards-modal")
  }

}
</script>
<style lang="scss">

</style>
