<template>
  <b-modal
    id="transfer-cards-modal"
    ref="modalRef"
    :title="$t('components.modals.transfer_cards_modal.title')"
    hide-footer
    centered
    @show="resetModal()"
  >
    <b-container fluid>
      <h6>{{ $t('components.modals.transfer_cards_modal.card_id') }} {{cardToTransfer.id}}</h6>
      <h6>{{ $t('components.modals.transfer_cards_modal.name') }} {{cardToTransfer.display_name}}</h6>
      <h6>{{ $t('components.modals.transfer_cards_modal.variation') }} {{cardToTransfer.variation}}</h6>
      <h6>{{ $t('components.modals.transfer_cards_modal.your_exist_card') }} {{cardToTransfer.amount}}</h6>
      {{ $t('components.modals.transfer_cards_modal.amount', { amount: cardToTransfer.amount }) }}
      <b-input
        class="my-2"
        type="number"
        v-model.number="amountToTransfer"
        :max="cardToTransfer.amount"
        :min="1"
      ></b-input>{{ $t('components.modals.transfer_cards_modal.receiver_address') }}
      <input-address
        v-model="receiverAddress"
        chain="loom"
        :blacklist="[ownAddress]"
        :placeholder="$t('input_placeholder.loom_addr')"
        @isValid="isValidAddressFormat"
      />
      <b-form-checkbox
        class="my-2"
        id="confirmCard"
        v-model="confirmCard"
        name="confirmCard"
        v-show="amountToTransfer && receiverAddress"
      >{{ $t('components.modals.transfer_cards_modal.amount', { amount: amountToTransfer, receiverAddress: receiverAddress }) }}</b-form-checkbox>
      <b-button
        class="my-2"
        type="button"
        @click="transferCardsHandler()"
        :disabled="validInput === false"
      >{{ $t('components.modals.transfer_cards_modal.transfer') }}</b-button>
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
import { feedbackModule } from "../../feedback/store"
import { formatToLoomAddress } from "../../utils"
@Component({
  components: {
    InputAddress,
  },
})
export default class TransferCardsModal extends Vue {
  amountToTransfer: number = 1
  receiverAddress: string = ""
  transferCards = assetsModule.transferCards
  showError = feedbackModule.showError
  confirmCard = false
  isValidAddress = false

  resetModal() {
    this.amountToTransfer = 1
    this.receiverAddress = ""
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get cardToTransfer() {
    return this.state.assets.cardToTransferSelected
  }

  get ownAddress() {
    return formatToLoomAddress(this.state.plasma.address.toLowerCase())
  }

  get validInput(): boolean {
    return this.isValidAddress &&
      Number(this.amountToTransfer) <= this.cardToTransfer!.amount &&
      Number(this.amountToTransfer) > 0 &&
      this.confirmCard
  }

  transferCardsHandler() {
    const amount = Number(this.amountToTransfer)
    console.log("amount", amount)
    // @ts-ignore
    if (parseInt("" + this.amountToTransfer, 10) > parseInt(this.cardToTransfer!.amount, 10) ||
      parseInt("" + this.amountToTransfer, 10) % 1 !== 0) {
      this.showError(this.$t("messages.invalid_amount").toString())
      return
    }
    if (this.receiverAddress === "") {
      this.showError(this.$t("messages.invalid_addr").toString())
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
    console.log(this.isValidAddress)
  }

}
</script>
<style lang="scss">
</style>
