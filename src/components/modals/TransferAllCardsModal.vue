<template>
  <b-modal
    id="transfer-all-cards-modal"
    ref="modalRef"
    :title="$t('components.modals.transfer_all_cards.title')"
    hide-footer
    centered
    @show="resetModal()"
  >
    <b-container fluid>
      <h6>
        <i18n path="components.modals.transfer_all_cards.this_will_transfer">
          <strong place="edition">{{ cardsToTransfer.edition }}</strong>
        </i18n>
      </h6>
      <h6>{{ $t('components.modals.transfer_all_cards.amount') }} {{cardsToTransfer.amount}}</h6>{{ $t('components.modals.transfer_all_cards.receiver_address') }}
      <input-address
        v-model="receiverAddress"
        chain="loom"
        :blacklist="[ownAddress]"
        :placeholder="$t('input_placeholder.loom_addr')"
        @isValid="isValidAddressFormat"
      />
      <b-form-checkbox
        class="my-2"
        v-model="confirmCards"
        name="confirmCards"
        v-show="receiverAddress"
      >{{ $t('components.modals.transfer_all_cards.receiver_address', { amount: cardsToTransfer.amount, receiverAddress: receiverAddress}) }}</b-form-checkbox>
      <b-button
        class="my-2"
        type="button"
        @click="transferAllCardsHandler()"
        :disabled="!receiverAddress || !confirmCards || !isValidAddress"
      >{{ $t('components.modals.transfer_all_cards.transfer_all') }}</b-button>
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
