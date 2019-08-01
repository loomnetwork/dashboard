<template>
  <b-card title="Rewards" class="mb-4">
    <div class="mb-4">
      <div v-if="state.dpos.loading.delegations">
        <b-spinner variant="primary" label="Spinning" />
      </div>
      <div v-else-if="hasRewardsUnclaimed">
        <h6>{{ $t('views.rewards.unclaimed_rewards') }}</h6>
        <h5 class="highlight">{{rewardsUnclaimed | tokenAmount}} LOOM</h5>
      </div>
      <div
        v-else-if="hasRewardsBeingClaimed"
      >{{rewardsBeingClaimed| tokenAmount}} {{ $t('views.rewards.will_be_reclaimed_after_next_election') }}</div>
      <div v-else>
        <h6>
          {{ $t('views.rewards.no_rewards') }}
          <!-- only show this is user has no delegations
            Please visit the
            <router-link
              to="/validators"
              exact-active-class="router-active"
          >{{ $t('components.faucet_sidebar.validators') }}</router-link>page.-->
        </h6>
      </div>
    </div>
    <b-button
      id="claim-rewards"
      class="px-5 py-2"
      variant="primary"
      @click="claimRewards"
      :disabled="hasRewardsUnclaimed === false"
    >{{ $t('views.rewards.claim_reward') }}</b-button>
  </b-card>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"

import BN from "bn.js"
import { dposModule } from "@/dpos/store"
import { HasDPOSState } from "@/dpos/store/types"
import { ZERO } from "../../utils"
import { plasmaModule } from "../../store/plasma"

@Component
export default class Rewards extends Vue {

  hideTooltip = false
  pollInterval = null


  get state(): HasDPOSState {
    return this.$store.state
  }

  get rewardsUnclaimed() {
    return dposModule.rewardsUnclaimedTotal()
  }

  get rewardsBeingClaimed() {
    return dposModule.rewardsBeingClaimedTotal()
  }

  get hasRewardsUnclaimed() {
    return this.rewardsUnclaimed.gt(ZERO)
  }
  get hasRewardsBeingClaimed() {
    return this.rewardsBeingClaimed.gt(ZERO)
  }

  async claimRewards() {
    if (! await plasmaModule.signerIsSet()) {
      return
    }
    dposModule.claimRewards()
  }

}
</script>

<style lang="scss" scoped>
#rewards {
  padding: 24px;
  h4 {
    color: grey;
  }
  strong {
    color: #f0ad4e;
  }
}
</style>
