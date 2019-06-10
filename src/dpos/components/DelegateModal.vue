<template>
  <b-modal v-model="visible" id="faucet-delegate-modal" ok-only hide-header>
    <b-container fluid>
      <b-row class="my-1 mb-3">
        <b-col sm="3">
          <label>{{ $t('components.modals.faucet_delegate_modal.amount') }}</label>
        </b-col>
        <b-col sm="9">
          <b-form-input v-model="delegationAmount" :state="isAmountValid" type="number"></b-form-input>
        </b-col>
      </b-row>
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
      <b-button
        v-if="!loading"
        style="width: 160px; float: right;"
        variant="primary"
        :disabled="!isAmountValid"
        @click="requestDelegate"
      >{{$t("delegate")}}</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import BN from "bn.js"
import { CommonTypedStore } from "../../store/common"
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

  setError = CommonTypedStore.setError

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
    return this.dposState.intent === "delegate"
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
    } else {
      this.delegation!.amount = new BN("-1")
    }
  }

  /**
   * LOOM balance
   * @returns LOOM balance (not wei)
   */
  get balance(): number {
    const wei = this.state.plasma.coins.loom.balance
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

    return d.amount.gt(ZERO) && d.amount.lte(this.state.plasma.coins.loom.balance)
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
