<template>
  <b-card title="Rewards" class="mb-4">
    <div class="mb-4">
      <div v-if="state.dpos.loading.delegations">
        <b-spinner variant="primary" label="Spinning"/>
      </div>
      <div v-else-if="hasRewards">
        <h6>{{ $t('views.rewards.unclaimed_rewards') }}</h6>
        <h5 class="highlight">{{state.dpos.rewards | tokenAmount}} LOOM</h5>
      </div>
      <div v-else>
        <h6>
          You do not have any rewards at the moment.
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
      id="claimRewardBtn"
      class="px-5 py-2"
      variant="primary"
      @click="claimRewards"
      :disabled="hasRewards === false"
    >{{ $t('views.rewards.claim_reward') }}</b-button>
    <b-tooltip
      v-if="!hideTooltip"
      target="claimRewardBtn"
      placement="bottom"
      title="Once the lock time period has expired, click here to claim your reward"
    ></b-tooltip>
  </b-card>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"

import BN from "bn.js"
import { dposModule } from "@/store/dpos"
import { HasDPOSState } from "../../store/dpos/types"

@Component
export default class Rewards extends Vue {

  hideTooltip = false
  pollInterval = null

  claimRewards = dposModule.claimRewards

  get state(): HasDPOSState {
    return this.$store.state
  }

  get hasRewards() {
    return this.state.dpos.rewards.gt(new BN("0"))
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
