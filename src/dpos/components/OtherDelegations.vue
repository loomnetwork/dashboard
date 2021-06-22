<template>
  <div class="validation-delegations">
    <!-- <b-card class="mb-4"> -->
    <h6>Total stake: {{ totalStaked | tokenAmount(18, 0) }} LOOM</h6>
    <div role="tablist" v-if="delegations.length">
      <div v-for="(tier, index) in locktimeTiers">
        <b-button
          block
          aria-controls="collapse-4"
          @click="showDetail(index)"
          class="my-2"
          v-if="getSumDelegations(getDelegationsTier(index)) > 0"
          v-b-toggle="'accordion-' + currentTier"
        >
          <dl>
            <dt>Locktime {{ tier }}</dt>
            <dd>
              {{ getSumDelegations(getDelegationsTier(index)) | tokenAmount }}
              LOOM
            </dd>
          </dl>
        </b-button>
        <b-collapse
          :id="'accordion-' + index"
          class="mt-2"
          :visible="index == currentTier"
        >
          <b-card
            v-for="(delegation, i) in getDelegationsTier(index)"
            :key="delegation.unlockTime"
            class="my-2"
          >
            <dl>
              <dt>delegator</dt>
              <dd>loom{{validator.address.local.toString().substring(2)}}</dd>
            </dl>
            <dl>
              <dt>delegation index</dt>
              <dd>{{ delegation.index }}</dd>
            </dl>
            <dl>
              <dt>amount staked</dt>
              <dd>{{ delegation.amount | tokenAmount }} LOOM</dd>
            </dl>
            <dl>
              <dt>tier</dt>
              <dd>{{delegation.lockTimeTier | lockTimeTier}}</dd>
            </dl>
            <dl>
              <dt>unlock time</dt>
              <dd>{{delegation.lockTime | date('seconds')}}</dd>
            </dl>
          </b-card>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"

import { Delegation, HasDPOSState, Validator } from "@/dpos/store/types"
import { ZERO } from "@/utils"

@Component({
  components: {},
})
export default class OtherDelegations extends Vue {
  zero = ZERO

  @Prop({ required: true }) validator!: Validator

  get state(): HasDPOSState {
    return this.$store.state
  }

  get totalStaked() {
    return this.validator.totalStaked
  }

  get delegations() {
    return this.validator.allDelegations
  }

  getDelegationsTier(tierIndex: number) {
    return this.delegations.filter((d) => d.lockTimeTier === tierIndex)
  }

  getSumDelegations(delegations: Delegation[]) {
    let sum = ZERO
    delegations.forEach((delegation) => {
      sum = sum.add(delegation.amount)
    })
    return sum
  }

  get locktimeTiers() {
    return [
      this.$t("components.modals.faucet_delegate_modal.two_weeks").toString(),
      this.$t(
        "components.modals.faucet_delegate_modal.three_months"
      ).toString(),
      this.$t("components.modals.faucet_delegate_modal.six_months").toString(),
      this.$t("components.modals.faucet_delegate_modal.one_year").toString(),
    ]
  }

  currentTier = 5

  showDetail(selectedTier) {
    this.currentTier = selectedTier
  }
}
</script>
<style lang="scss" scoped>
header {
  font-weight: 500;
}
dl {
  display: flex;
  flex-wrap: wrap;
  dt,
  dd {
    flex: 50%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    line-height: 24px;
    padding: 8px 0 8px;
    margin: 0;
  }
  dt {
    font-weight: normal;
  }
  dd {
    font-weight: 500;
    text-align: right;
  }
}
</style>
