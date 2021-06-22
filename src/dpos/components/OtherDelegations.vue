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
          <b-table
            striped
            hover
            :items="getDelegationsTier(index)"
            :fields="tableFields"
          >
            <template scope="item" slot="delegator">
              loom{{ item.item.delegator.local.toString().substring(2) }}
            </template>
            <template scope="item" slot="index">
              {{ item.item.index }}
            </template>
            <template scope="item" slot="amount">
              {{ item.item.amount | tokenAmount }} LOOM
            </template>
            <template scope="item" slot="lockTimeTier">
              {{ item.item.lockTimeTier | lockTimeTier }}
            </template>
            <template scope="item" slot="lockTime">
              {{ item.item.lockTime | date("seconds") }}
            </template>
          </b-table>
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

  tableFields = [
    { key: "delegator", label: "Delegator" },
    { key: "index", label: "Delegation index" },
    { key: "amount", label: "Amount staked" },
    { key: "lockTimeTier", label: "Tier" },
    { key: "lockTime", label: "Unlock time" },
  ]
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
