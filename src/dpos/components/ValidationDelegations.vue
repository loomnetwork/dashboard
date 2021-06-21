<template>
  <div class="validation-delegations">
    <!-- <b-card class="mb-4"> -->
    <h6>Total stake: {{ totalStaked | tokenAmount(18, 0) }} LOOM</h6>
    <div role="tablist" v-if="delegations.length">
      <div v-for="(tier, index) in locktimeTiers">
        <b-button
          block
          :aria-expanded="visible ? 'true' : 'false'"
          aria-controls="collapse-4"
          @click="visible = !visible"
          class="my-2"
        >
          <dl v-if="">
            <dt>Locktime {{ tier }}</dt>
            <dd>
              {{
                getSumDelegations(getDelegationsTier(index)) | tokenAmount
              }}
              LOOM
            </dd>
            <!-- getDelegationsTier(index) -->
          </dl>
        </b-button>
        <!-- <b-collapse id="collapse-4" v-model="visible" class="mt-2">
          <b-card
            v-for="(delegation, i) in delegations"
            :key="delegation.unlockTime"
            >I should start open!

            <dl>
              <dt>Tier {{ i }}</dt>
              <dd>{{ delegation.amount | tokenAmount }} LOOM</dd>
            </dl>
          </b-card>
        </b-collapse> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"

import { Delegation, HasDPOSState, Validator } from "@/dpos/store/types"
import { ZERO } from "@/utils"
import { formatTokenAmount } from "@/filters"

@Component({
  components: {},
})
export default class ValidationDelegations extends Vue {
  zero = ZERO
  visible = true
  /**
   * Filter by validator
   */
  @Prop({ required: true }) validator!: Validator
  // delegations = []

  get state(): HasDPOSState {
    return this.$store.state
  }

  get totalStaked() {

    // console.log("this.state.dpos.delegations,",this.state.dpos);
    // console.log("this.validator.delegations,",this.validator);
    return this.validator.totalStaked
  }
  summm = ZERO

  get delegations() {
    
    // return this.state.dpos.delegations.filter((d) => d.validator.addr === this.validator!.addr)
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
