<template>
  <b-modal
    id="transfer-all-cards-modal"
    ref="modalRef"
    title="Transfer All Cards"
    hide-footer
    centered
  >
    <b-container fluid>
      <h6> This will transfer all of your <strong>{{cardsToTransfer.edition}}</strong> edition cards.</h6>
      <h6>Amount: {{cardsToTransfer.amount}}</h6>
      Receiver Loom Address:
      <b-input class="my-2" type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input>
      <b-form-checkbox class="my-2"
        id="confirmCards"
        v-model="confirmCards"
        name="confirmCards"
        v-show="receiverAddress">        
        I confirm to transfer {{cardsToTransfer.amount}} cards to {{receiverAddress}} address.
      </b-form-checkbox>
      <b-button class="my-2" type="button" @click="transferAllCardsHandler()" :disabled="!receiverAddress || !confirmCards" >Transfer All</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "../../store/plasma/assets"
import { CommonTypedStore } from "../../store/common"

@Component
export default class TransferAllCardsModal extends Vue {
  receiverAddress: string = ""
  transferCards = assetsModule.transferCards
  setErrorMsg = CommonTypedStore.setErrorMsg
  confirmCards = false

  mounted() {
    this.receiverAddress = ""
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get cardsToTransfer() {
    return this.state.assets.allCardsToTransferSelected
  }

  transferAllCardsHandler() {
    if (this.receiverAddress === "") {
      this.setErrorMsg("Invalid receiver address")
      return
    }
    const cardsToTransfer = this.cardsToTransfer.cards
    const cardIds: string[] = []
    const amounts: number[] = []
    cardsToTransfer.map((card) => {
      cardIds.push(card.id)
      amounts.push(card.amount)
    })
    this.transferCards({
      cardIds,
      amounts,
      receiver: this.receiverAddress,
    })
    this.$root.$emit("bv::hide::modal", "transfer-all-cards-modal")
  }
}
</script>
