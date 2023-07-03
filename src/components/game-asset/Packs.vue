<template>
  <b-card class="packs-view" no-body>
    <transfer-packs-modal ref="transferPackModalConfig"></transfer-packs-modal>
    <b-card-header>
      <h4 class="card-title">{{ $t('components.gameAsset.packs.my_packs') }}</h4>
    </b-card-header>
    <b-list-group flush>
      <b-list-group-item v-for="pack in packs" :key="pack.type">
        <label class="name">{{ pack.type | capitalizeWord}}</label>
        <span class="balance">{{pack.amount}}</span>
        <b-button-group class="actions">
          <b-button
            class="button"
            :disabled="pack.amount == '0'"
            size="sm"
            variant="outline-primary"
            @click="transferpackTo(pack)"
          >{{ $t('components.gameAsset.packs.transfer') }}</b-button>
        </b-button-group>
      </b-list-group-item>
    </b-list-group>
  </b-card>
</template>


<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { assetsModule } from "@/store/plasma/assets"
import { PACKS_NAME } from "@/store/plasma/assets/reactions"
import TransferPacksModal from "@/components/modals/TransferPacksModal.vue"
import { BModal } from "bootstrap-vue"
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
    return this.$refs[ref] as BModal
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
<style lang="scss" scoped>
.card {
  border: none;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
}
.packs-view {
  max-width: 600px;
  .card-header {
    display: flex;
    align-items: center;
    background: none;
    > h4 {
      width: 100%;
      margin: 0 0 16px;
    }
  }
}

.list-group {
  height: calc(100vh - 229px);
  overflow-y: scroll;
}

.list-group-item {
  display: flex;
  align-items: center;
  background: transparent;
  border: 1px 0 solid rgba(0, 0, 0, 0.125);
  .name {
    flex: 1;
    white-space: nowrap;
  }
  .name,
  .balance {
    line-height: 36px;
    margin: 0;
  }
  .balance {
    flex: 1;
    text-align: right;
    padding: 0 16px;

    > small {
      opacity: 0.8;
    }
  }
}

/* bigger than mobile ----------- */
@media only screen and (min-width: 520px) {
  .card-header {
    flex-wrap: nowrap;
    > h4 {
      margin: 0 20px 0 0;
    }
  }
  .list-group-item {
    flex-wrap: nowrap;
    .actions {
      width: 120px;
    }
  }
}
</style>
