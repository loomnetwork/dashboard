<template>
  <b-modal
    id="transfer-all-cards-modal"
    ref="modalRef"
    title="Transfer All Cards"
    hide-footer
    centered
    @show="resetModal()"
  >
    <b-container fluid>
      <h6>
        This will transfer all of your
        <strong>{{cardsToTransfer.edition}}</strong> edition cards.
      </h6>
      <h6>Amount: {{cardsToTransfer.amount}}</h6>Receiver Loom Address:
      <input-address
        v-model="receiverAddress"
        chain="loom"
        :blacklist="[ownAddress]"
        :placeholder="'Loom Address'"
        @isValid="isValidAddressFormat"
      />
      <b-form-checkbox
        class="my-2"
        v-model="confirmCards"
        name="confirmCards"
        v-show="receiverAddress"
      >I confirm that i want to transfer {{cardsToTransfer.amount}} cards to {{receiverAddress}} address.</b-form-checkbox>
      <b-button
        class="my-2"
        type="button"
        @click="transferAllCardsHandler()"
        :disabled="!receiverAddress || !confirmCards || !isValidAddress"
      >Transfer All</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "../../store/plasma/assets"
import { feedbackModule } from "../../feedback/store"
import InputAddress from "../InputAddress.vue"
import { formatToLoomAddress } from "../../utils"

@Component({
  components: {
    InputAddress,
  },
})
export default class TransferAllCardsModal extends Vue {
  receiverAddress: string = ""
  transferCards = assetsModule.transferCards
  showError = feedbackModule.showError
  confirmCards = false
  isValidAddress = false

  resetModal() {
    this.receiverAddress = ""
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get cardsToTransfer() {
    return this.state.assets.allCardsToTransferSelected
  }

  get ownAddress() {
    return formatToLoomAddress(this.state.plasma.address.toLowerCase())
  }

  transferAllCardsHandler() {
    if (this.receiverAddress === "") {
      this.showError(this.$t("messages.receiver_addr_err_tx").toString())
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

  isValidAddressFormat(isValid) {
    this.isValidAddress = isValid
  }
}
</script>
