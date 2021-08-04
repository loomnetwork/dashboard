<template>
  <div class="validation-delegations py-2">
    <h6>
      {{ $t("components.other_delegations.total_staked") }}:
      {{ totalStaked | tokenAmount(18, 3) }} LOOM
    </h6>
    <div role="tablist" v-if="delegations.length">
      <div v-for="(tier, index) in locktimeTiers" :key="'lt_'+index">
        <b-button
          block
          aria-controls="collapse-4"
          @click="showDetail(index)"
          class="my-2"
          v-if="getSumDelegations(getDelegationsTier(index)) > 0"
          v-b-toggle="'accordion-' + currentTier"
        >
          <dl>
            <dt>
              {{ $t("components.other_delegations.lock_time") }}: {{ tier }}
            </dt>
            <dd>
              {{ getSumDelegations(getDelegationsTier(index)) | tokenAmount(18, 3) }}
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
            :per-page="perPage"
            :current-page="currentPage"
          >
            <template slot-scope="data" slot="delegator">
              {{ data.item.delegator.local.toString() | loomAddress }}
            </template>
            <template slot-scope="data" slot="index">
              {{ data.item.index }}
            </template>
            <template slot-scope="data" slot="amount">
              {{ data.item.amount | tokenAmount(18, 3) }} LOOM
            </template>
            <template slot-scope="data" slot="lockTime">
              <span v-if="data.item.lockTime > today">
                {{ data.item.lockTime | dateWithoutTime }}
              </span>
              <span v-else>
                {{ $t("views.validator_detail.unlocked") }}
              </span>
            </template>
          </b-table>
          <b-pagination
            v-model="currentPage"
            :total-rows="getDelegationsTier(index).length"
            :per-page="perPage"
            aria-controls="my-table"
            v-if="getDelegationsTier(index).length / perPage > 1"
            align="right"
          ></b-pagination>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"

import { Delegation, HasDPOSState, Validator } from "@/dpos/store/types"
import { ZERO } from "@/utils"

@Component
export default class OtherDelegations extends Vue {
  @Prop({ required: true }) validator!: Validator

  zero = ZERO
  currentTier = 5
  perPage = 10
  currentPage = 1

  get state(): HasDPOSState {
    return this.$store.state
  }

  get totalStaked() {
    return this.validator.totalStaked
  }

  get delegations() {
    return this.validator.allDelegations
  }

  get locktimeTiers() {
    return [
      this.$t("components.modals.faucet_delegate_modal.two_weeks").toString(),
      this.$t("components.modals.faucet_delegate_modal.three_months").toString(),
      this.$t("components.modals.faucet_delegate_modal.six_months").toString(),
      this.$t("components.modals.faucet_delegate_modal.one_year").toString(),
    ]
  }

  get today() {
    return  Date.now() / 1000
  }

  get tableFields() {
    return [
      {
        key: "delegator",
        label: this.$t("components.other_delegations.delegator").toString(),
      },
      {
        key: "index",
        label: this.$t("components.other_delegations.delegation_index").toString(),
      },
      {
        key: "amount",
        label: this.$t("views.validator_detail.amount_delegated").toString(),
      },
      {
        key: "lockTime",
        label: this.$t("views.validator_detail.unlock_time").toString(),
      },
    ]
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

  showDetail(selectedTier) {
    this.currentTier = selectedTier
    this.currentPage = 1
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
    text-align: left;
  }
  dd {
    font-weight: 500;
    text-align: right;
  }
}
</style>
