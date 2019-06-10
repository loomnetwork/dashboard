<template>
  <b-modal
    v-model="visible"
    id="faucet-delegate-modal"
    ok-only
    hide-header-close
    title="Stake tokens"
  >
    <b-form-group
      id="gdelegation-amount-input"
      :label="$t('components.modals.faucet_delegate_modal.amount')"
      label-for="delegation-amount-input"
      :description="'Your balance is ' + balance + ' LOOM'"
    >
      <b-form-input
        id="delegation-amount-input"
        v-model.number="delegationAmount"
        required
        placeholder="Enter amount"
        :state="isAmountValid"
        inputmode="numeric"
        pattern="[0-9]*"
      ></b-form-input>
    </b-form-group>

    <div slot="modal-footer" class="w-100">
      <b-button @click="cancel">{{$t("cancel")}}</b-button>
      <b-button
        v-if="!loading"
        style="width: 160px; float: right;"
        variant="primary"
        :disabled="!isAmountValid"
        @click="delegate"
      >{{$t("undelegate")}}</b-button>
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

const MULTIPLIER = new BN("10").pow(new BN("18"))

@Component
export default class DelegateModal extends Vue {

  minAmount = new BN("1")
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
    console.log("delegate ? ", this.dposState.intent, this.dposState.delegation)
    return this.dposState.intent === "undelegate" && this.dposState.delegation !== null
  }

  set visible(val: boolean) {
    console.log("set visible...")
  }

  get validators() {
    return this.state.dpos.validators
  }

  get unbondAmount(): number {
    return this.delegation!.updateAmount.div(MULTIPLIER).toNumber()
  }

  // if empty or invalid Vue returns ""
  set unbondAmount(amount: number) {
    if (Number.isInteger(amount)) {
      this.delegation!.updateAmount = MULTIPLIER.mul(new BN(amount))
    }
  }

  get maxAmount(): number {
    const wei = this.delegation!.amount
    return wei.div(MULTIPLIER).toNumber()
  }

  async undelegate() {
    dposModule.undelegate(this.delegation!)
  }

  get isAmountValid() {
    const d = this.delegation!
    return d.updateAmount.gt(ZERO) && d.updateAmount.lte(d.amount)
  }

  cancel() {
    dposModule.cancelRequest()
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
