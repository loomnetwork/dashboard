<template>
  <b-modal id="transfer-cards-modal" ref="modalRef" title="Transfer Cards" hide-footer centered>
    <b-container fluid>
      <h6>Card ID: {{cardToTransfer.id}}</h6>
      <h6>Name: {{cardToTransfer.display_name}}</h6>
      <h6>Variation: {{cardToTransfer.variation}}</h6>
      <h6>Your existing card: {{cardToTransfer.amount}}</h6>
      Amount: (max: {{cardToTransfer.amount}})
      <b-input
        class="my-2"
        type="number"
        v-model="amountToTransfer"
        :max="cardToTransfer.amount"
        :min="1"
      ></b-input>Receiver Loom Address:
      <input-address
        v-model="receiverAddress"
        :placeholder="'Loom Address'"
        @isValid="isValidAddressFormat"
      />
      <b-form-checkbox
        class="my-2"
        id="confirmCard"
        v-model="confirmCard"
        name="confirmCard"
        v-show="amountToTransfer && receiverAddress"
      >I confirm to transfer {{amountToTransfer}} cards to {{receiverAddress}} address.</b-form-checkbox>
      <b-button
        class="my-2"
        type="button"
        @click="transferCardsHandler()"
        :disabled=" !receiverAddress || !amountToTransfer || amountToTransfer > parseInt(cardToTransfer.amount) || amountToTransfer < 1 || !confirmCard || !isValidAddress"
      >Transfer</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import InputAddress from "../InputAddress.vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "../../store/plasma/assets"
import { CommonTypedStore } from "../../store/common"
@Component({
  components: {
    InputAddress
  }
})
export default class TransferCardsModal extends Vue {
  amountToTransfer: number = 1
  receiverAddress: string = ""
  transferCards = assetsModule.transferCards
  setErrorMsg = CommonTypedStore.setErrorMsg
  confirmCard = false
  isValidAddress = false

  mounted() {
    this.amountToTransfer = 1
    this.receiverAddress = ""
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get cardToTransfer() {
    return this.state.assets.cardToTransferSelected
  }

  transferCardsHandler() {
    if (this.amountToTransfer > this.cardToTransfer!.amount || this.amountToTransfer % 1 !== 0) {
      this.setErrorMsg("message.invalid_amount")
      return
    }
    if (this.receiverAddress === "") {
      this.setErrorMsg("message.invalid_addr")
      return
    }
    this.transferCards({
      cardIds: [this.cardToTransfer!.id],
      amounts: [this.amountToTransfer],
      receiver: this.receiverAddress,
    })
    this.$root.$emit("bv::hide::modal", "transfer-cards-modal")
  }

  isValidAddressFormat(isValid) {
    this.isValidAddress = isValid
    console.log(this.isValidAddress);
  }

}
</script>
<style lang="scss">
</style>
