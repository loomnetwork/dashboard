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

    <b-container fluid>
      <b-row class="my-1" key="range">
        <b-col sm="6">
          <label
            id="lockTimeReward"
            for="locktime"
          >{{ $t('components.modals.faucet_delegate_modal.locktime_bonuses') }}</label>
        </b-col>
        <b-col sm="6">
          <span>{{locktimeTiers[locktimeTierVal]}} / {{bonusTiers[locktimeTierVal]}}</span>
        </b-col>
        <b-col>
          <b-form-input
            v-model="locktimeTierVal"
            :min="minLockTimeTier"
            max="3"
            :formatter="formatRangeInput"
            id="locktime"
            type="range"
            data-toggle="tooltip"
          ></b-form-input>
        </b-col>
      </b-row>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-button @click="cancel">Cancel</b-button>
      <b-button
        v-if="!loading"
        style="width: 160px; float: right;"
        variant="primary"
        :disabled="!isAmountValid"
        @click="delegate"
      >{{$t("delegate")}}</b-button>
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

  @Prop({})
  locktimeTier = 0
  locktimeTierVal = 0
  validator = null
  showValidators = false
  formattedValidators: any[] = []
  unbond = false
  loading = false
  okTitle = "Delegate"

  locktimeTiers = [
    "2 weeks",
    "3 months",
    "6 months",
    "1 year",
  ]

  bonusTiers = [
    "x1",
    "x1.5",
    "x2",
    "x4",
  ]

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
    return this.dposState.intent === "delegate" && this.dposState.delegation !== null
  }

  set visible(val: boolean) {
    console.log("set visible...")
  }

  get validators() {
    return this.state.dpos.validators
  }

  get delegationAmount(): number {
    return this.delegation!.amount.div(MULTIPLIER).toNumber()
  }

  // if empty or invalid Vue returns ""
  set delegationAmount(amount: number) {
    if (Number.isInteger(amount)) {
      this.delegation!.amount = MULTIPLIER.mul(new BN(amount))
    }
  }

  /**
   * LOOM balance
   * @returns LOOM balance (not wei)
   */
  get balance(): number {
    const wei = this.state.plasma.coins.LOOM.balance
    return wei.div(MULTIPLIER).toNumber()
  }

  get maxAmount(): number {
    return Math.floor(this.balance)
  }

  async delegate() {
    dposModule.delegate(this.dposState.delegation!)
  }

  formatRangeInput(value, event) {
    return value
  }

  get isAmountValid() {
    const d = this.delegation!

    return d.amount.gt(ZERO) && d.amount.lte(this.state.plasma.coins.LOOM.balance)
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
