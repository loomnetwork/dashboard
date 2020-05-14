<template>
  <b-modal
    v-model="visible"
    id="faucet-delegate-modal"
    ok-only
    hide-header-close
    :title="$t('components.modals.faucet_undelegate_modal.undelegate')"
  >
    <b-form-group
      v-if="delegation"
      id="delegation-amount-input"
      :label="$t('components.modals.faucet_delegate_modal.amount')"
      label-for="delegation-amount-input"
    >
      <div>
        <amount-input
          :min="minWeiAmount"
          :max="delegation.amount"
          v-model="delegation.updateAmount"
          symbol="LOOM"
        />
      </div>
    </b-form-group>

    <div slot="modal-footer" class="w-100">
      <b-button @click="cancel">{{$t("button.cancel")}}</b-button>
      <b-button
        style="width: 160px; float: right;"
        variant="primary"
        :disabled="!isAmountValid"
        @click="undelegate"
      >{{$t('components.modals.faucet_undelegate_modal.undelegate')}}</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import BN from "bn.js"
import { dposModule } from "@/dpos/store"
import { HasDPOSState, DPOSState } from "@/dpos/store/types"
import { ZERO } from "../../utils"
import AmountInput from "@/components/AmountInput.vue"
const MULTIPLIER = new BN("10").pow(new BN("18"))

@Component({
  components: {
    AmountInput,
  },
})
export default class DelegateModal extends Vue {

  minWeiAmount = new BN(10 * 18)
  minLockTimeTier = 0

  get state(): HasDPOSState {
    return this.$store.state
  }

  get dposState(): DPOSState {
    return this.state.dpos
  }

  get delegation() {
    return this.dposState.delegation
  }

  get visible() {
    return this.dposState.intent === "undelegate" && this.dposState.delegation !== null
  }

  set visible(val: boolean) {
    console.log("set visible...")
    if (val === false) {
      dposModule.clearRequest()
    }
  }

  get validators() {
    return this.state.dpos.validators
  }

  async undelegate() {
    dposModule.undelegate(this.delegation!)
    dposModule.clearRequest()
  }

  get isAmountValid() {
    const d = this.delegation
    return d && d.updateAmount.gt(ZERO) && d.updateAmount.lte(d.amount)
  }

  cancel() {
    dposModule.clearRequest()
  }

}
</script>
<style lang="scss">
label {
  color: gray;
}
.loading-spinner-container {
  height: 200px;
}
</style>
