<template>
  <b-modal
    id="transfer-packs-modal"
    ref="modalRef"
    title="Transfer Packs"
    hide-footer
    centered
    @show="resetModal()"
  >
    <b-container fluid>
      <h6>Pack type: {{packToTransfer.type}}</h6>
      <h6>Your existing pack: {{packToTransfer.amount}}</h6>
      Amount: (max: {{packToTransfer.amount}})
      <b-input
        class="my-2"
        type="number"
        v-model="amountToTransfer"
        :max="packToTransfer.amount"
        :min="1"
      ></b-input>Receiver Loom Address:
      <input-address
        v-model="receiverAddress"
        chain="loom"
        :placeholder="'Loom Address'"
        @isValid="isValidAddressFormat"
      />
      <b-form-checkbox
        class="my-2"
        id="confirmPack"
        v-model="confirmPack"
        name="confirmPack"
        v-show="amountToTransfer && receiverAddress"
      >I confirm to transfer {{amountToTransfer}} packs to {{receiverAddress}} address.</b-form-checkbox>
      <b-button
        class="my-2"
        type="button"
        @click="transferPacksHandler()"
        :disabled=" !receiverAddress || !amountToTransfer || amountToTransfer >  parseInt(packToTransfer.amount) || amountToTransfer <= 0 || !confirmPack || !isValidAddress"
      >Transfer</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "@/store/plasma/assets"
import { CommonTypedStore } from "@/store/common"
import InputAddress from "../InputAddress.vue"
import { feedbackModule } from "../../feedback/store";

@Component({
  components: {
    InputAddress
  }
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

  transferPacksHandler() {
    // @ts-ignore
    if (parseInt(this.amountToTransfer, 10) > parseInt(this.packToTransfer!.amount, 10) || parseInt(this.amountToTransfer, 10) % 1 !== 0) {
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
