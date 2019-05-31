<template>
  <b-modal id="transfer-packs-modal" ref="modalRef" title="Transfer Packs" hide-footer centered>
    <b-container fluid>
      <h6>Pack type: {{packToTransfer.type}}</h6>
      <h6>Your existing pack: {{packToTransfer.amount}}</h6>
      Amount: (max: {{packToTransfer.amount}})
      <b-input type="number" v-model="amountToTransfer" :max="packToTransfer.amount" :min="1"></b-input>Receiver Loom Address:
      <b-input type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input>
      <b-button type="button" @click="transferPacksHandler()">Transfer</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "@/store/plasma/assets"
import { CommonTypedStore } from "@/store/common"
import { DPOSTypedStore } from "@/store/dpos-old"

@Component
export default class TransferPacksModal extends Vue {
  amountToTransfer: number = 1
  receiverAddress: string = ""
  transferPacks = assetsModule.transferPacks
  setErrorMsg = CommonTypedStore.setErrorMsg

  mounted() {
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
    if (this.amountToTransfer > this.packToTransfer!.amount) {
      this.setErrorMsg("Invalid amount")
      return
    }
    if (this.receiverAddress === "") {
      this.setErrorMsg("Invalid receiver address")
      return
    }
    // TODO: put confirmation popup here
    this.transferPacks({
      packType: this.packToTransfer!.type,
      amount: this.amountToTransfer,
      receiver: this.receiverAddress,
    })
    this.$root.$emit("bv::hide::modal", "transfer-packs-modal")
  }

}
</script>
<style lang="scss">
</style>
