<template>
  <b-modal
    id="transfer-packs-modal"
    ref="modalRef"
    :title="$t('components.modals.transfer_packs_modal.title')"
    hide-footer
    centered
    @show="resetModal()"
  >
    <b-container fluid>
      <h6>{{ $t('components.modals.transfer_packs_modal.pack_type') }} {{packToTransfer.type}}</h6>
      <h6>{{ $t('components.modals.transfer_packs_modal.your_exist_pack') }} {{packToTransfer.amount}}</h6>
      {{ $t('components.modals.transfer_packs_modal.amount', {amount: packToTransfer.amount}) }})
      <b-input
        class="my-2"
        type="number"
        v-model="amountToTransfer"
        :max="packToTransfer.amount"
        :min="1"
      ></b-input>{{ $t('components.modals.transfer_packs_modal.receiver_address') }}
      <input-address
        v-model="receiverAddress"
        chain="loom"
        :blacklist="[ownAddress]"
        :placeholder="$t('input_placeholder.loom_addr')"
        @isValid="isValidAddressFormat"
      />
      <b-form-checkbox
        class="my-2"
        id="confirmPack"
        v-model="confirmPack"
        name="confirmPack"
        v-show="amountToTransfer && receiverAddress"
      >{{ $t('components.modals.transfer_packs_modal.receiver_address', { amount: amountToTransfer, receiverAddress: receiverAddress}) }}</b-form-checkbox>
      <b-button
        class="my-2"
        type="button"
        @click="transferPacksHandler()"
        :disabled=" !receiverAddress || !amountToTransfer || amountToTransfer >  parseInt(packToTransfer.amount) || amountToTransfer <= 0 || !confirmPack || !isValidAddress"
      >{{ $t('components.modals.transfer_packs_modal.transfer') }}</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "@/store/plasma/assets"
import InputAddress from "../InputAddress.vue"
import { feedbackModule } from "../../feedback/store"
import { formatToLoomAddress } from "../../utils"

@Component({
  components: {
    InputAddress,
  },
})
export default class TransferPacksModal extends Vue {
  amountToTransfer: number = 1
  receiverAddress: string = ""
  transferPacks = assetsModule.transferPacks
  showError = feedbackModule.showError
  confirmPack = false
  isValidAddress = false

  resetModal() {
    this.amountToTransfer = 1
    this.receiverAddress = ""
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get packToTransfer() {
    return this.state.assets.packToTransferSelected
  }

  get ownAddress() {
    return formatToLoomAddress(this.state.plasma.address.toLowerCase())
  }

  transferPacksHandler() {
    if (parseInt("" + this.amountToTransfer, 10) > parseInt("" + this.packToTransfer!.amount, 10) ||
      parseInt("" + this.amountToTransfer, 10) % 1 !== 0) {
      this.showError(this.$t("messages.invalid_amount").toString())
      return
    }
    if (this.receiverAddress === "") {
      this.showError(this.$t("messages.invalid_addr").toString())
      return
    }
    this.transferPacks({
      packType: this.packToTransfer!.type,
      amount: this.amountToTransfer,
      receiver: this.receiverAddress,
    })
    this.$root.$emit("bv::hide::modal", "transfer-packs-modal")
  }

  isValidAddressFormat(isValid) {
    this.isValidAddress = isValid
  }

}
</script>
<style lang="scss">
</style>
