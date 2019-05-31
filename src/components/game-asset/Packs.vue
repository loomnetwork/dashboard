<template>
  <b-card class="mb-5">
    <transfer-packs-modal ref="transferPackModalConfig"></transfer-packs-modal>
    <b-card-title>My Packs</b-card-title>
    <b-table
      v-show="packs && packs.length > 0"
      striped
      bordered
      hover
      :items="packs"
      :fields="packTableFields"
    >
    <template slot="transfer" slot-scope="row">
      <b-button type="button" @click="transferpackTo(row.item)" :disabled="row.item.amount == '0'"> Transfer </b-button>
    </template>
    </b-table>
  </b-card>
</template>


<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { plasmaModule } from "@/store/plasma"
import { assetsModule } from "@/store/plasma/assets"
import { PACKS_NAME } from "@/store/plasma/assets/reactions"
import TransferPacksModal from "@/components/modals/TransferPacksModal.vue"
import { Modal } from "bootstrap-vue"
import { PackDetail } from "@/store/plasma/types"
import { HasAssetsState } from "../../store/plasma/assets/types"

@Component({
  components: {
    TransferPacksModal,
  },
})
export default class Packs extends Vue {
  checkPackBalance = assetsModule.checkPackBalance
  setPackToTransferSelected = assetsModule.setPackToTransferSelected
  packTypes = PACKS_NAME
  packs: PackDetail[] = []
  packTableFields = [
    {
      key: "type",
      sortable: true,
    },
    {
      key: "amount",
      sortable: true,
    },
    {
      key: "transfer",
      label: "Transfer",
    },
  ]

  get state(): HasAssetsState {
    return this.$store.state
  }

  get packBalance() {
    return this.state.assets.packBalance
  }

  async mounted() {
    await this.checkPackBalance()
    this.packs = await this.packBalance
  }

  modal(ref: string) {
    return this.$refs[ref] as Modal
  }

  async transferpackTo(item) {
    this.setPackToTransferSelected(item)
    this.$root.$emit("bv::show::modal", "transfer-packs-modal")
  }

  @Watch("packBalance")
  async onUserPackChanged(
    newUserPacks: PackDetail[],
    oldUserPacks: PackDetail[],
  ) {
    this.packs = newUserPacks
  }

}
</script>