<template>
  <b-modal id="transfer-packs-modal" ref="modalRef" title="Transfer Packs" hide-footer centered>
    <b-container fluid>
      <h6>Pack type: {{packToTransfer.type}}</h6>
      <h6>Your existing pack: {{packToTransfer.amount}}</h6>
      Amount: (max: {{packToTransfer.amount}})
      <b-input class="my-2" type="number" v-model="amountToTransfer" :max="packToTransfer.amount" :min="1"></b-input> 
      Receiver Loom Address:
      <b-input class="my-2" type="text" v-model="receiverAddress" placeholder="Loom Address"></b-input>
      <b-form-checkbox class="my-2"
        id="confirmPack"
        v-model="confirmPack"
        name="confirmPack"
        v-show="amountToTransfer && receiverAddress">
        I confirm to transfer {{amountToTransfer}} packs to {{receiverAddress}} address.
      </b-form-checkbox>
      <b-button class="my-2" type="button" 
        @click="transferPacksHandler()" 
        :disabled=" !receiverAddress || !amountToTransfer || amountToTransfer >  parseInt(packToTransfer.amount) || amountToTransfer <= 0 || !confirmPack">Transfer</b-button>
    </b-container>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { assetsModule } from "@/store/plasma/assets"
import { CommonTypedStore } from "@/store/common"

@Component
export default class TransferPacksModal extends Vue {
  amountToTransfer: number = 1
  receiverAddress: string = ""
  transferPacks = assetsModule.transferPacks
  setErrorMsg = CommonTypedStore.setErrorMsg
  confirmPack = false

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
    if (this.amountToTransfer > this.packToTransfer!.amount || this.amountToTransfer % 1 !== 0) {
      this.setErrorMsg("Invalid amount")
      return
    }
    if (this.receiverAddress === "") {
      this.setErrorMsg("Invalid receiver address")
      return
    }
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
