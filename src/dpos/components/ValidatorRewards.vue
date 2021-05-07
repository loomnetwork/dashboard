<template>
  <div>
  <b-card no-body title="Rewards" class="mb-4">
    <b-list-group flush>
      <b-list-group-item class="rewards">
        <h4>{{ $t('views.rewards.rewards') }}</h4>
      </b-list-group-item>
      <!-- <b-list-group-item variant="secondary">
        <div class="d-flex w-100 justify-content-between space">
          <h6>Organic Delegators</h6>
          <span>10,000,000</span>
        </div>
      </b-list-group-item>
      <b-list-group-item>
        <div class="d-flex w-100 justify-content-between space">
          <h6>Referral: Cobo Wallet</h6>
          <span>10</span>
        </div>
      </b-list-group-item>
      <b-list-group-item variant="secondary">
        <div class="d-flex w-100 justify-content-between">
          <h6>Total from Delegators</h6>
          <span>10,000,010</span>
        </div>
      </b-list-group-item>
      <b-list-group-item>
        <div class="d-flex w-100 justify-content-between">
          <h6>From Delegators</h6>
          <span>20,000,000</span>
        </div>
      </b-list-group-item> -->
      <b-list-group-item variant="secondary">
        <div class="d-flex w-100 justify-content-between">
          <h6>{{ $t('views.rewards.total') }}</h6>
          <span>{{rewardsUnclaimed | tokenAmount}} LOOM</span>
        </div>
      </b-list-group-item>
    </b-list-group>
  </b-card>
  <b-button
      id="claim-rewards"
      class="px-5 py-2"
      variant="primary"
      @click="claimRewards"
      :disabled="hasRewardsUnclaimed === false"
    >{{ $t('views.rewards.claim_reward') }}</b-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { dposModule } from "@/dpos/store"
import { ZERO } from "@/utils"
import { HasDPOSState } from "@/dpos/store/types"

@Component
export default class ValidatorRewards extends Vue {

  claimRewards = dposModule.claimRewards

  get rewardsUnclaimed() {
    return dposModule.rewardsUnclaimedTotal()
  }

  get hasRewardsUnclaimed() {
    return this.rewardsUnclaimed.gt(ZERO)
  }

  get state(): HasDPOSState {
    return this.$store.state
  }
}
</script>

<style lang="scss" scoped>
.list-group-item {
  border: none;

  .space {
    padding-left: 2rem;
  }
}

h4 {
  margin-bottom: 0.75rem;
}

h6 {
  margin-bottom: 0;
}

.rewards {
  padding-top: 1.25rem;
  padding-bottom: 0;
  margin: 0;
}

#claim-rewards {
  float: right;
}

</style>
