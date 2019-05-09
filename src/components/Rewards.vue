<template>
  <b-card title="Rewards" class="mb-4">
    <div>
      <div class="mb-4">
        <div v-if="rewardsResults && rewardsResults <= 0">
          <h6>
            You do not have any rewards at the moment. Please visit the <router-link to="/validators" exact-active-class="router-active">{{ $t('components.faucet_sidebar.validators') }}</router-link> page.
          </h6>
        </div>
        <div v-else-if="rewardsResults > 0">
          <h6>
            {{ $t('views.rewards.unclaimed_rewards') }} 
          </h6>
          <h5 class="highlight">
            {{rewardsResults.toString() + " LOOM"}}
          </h5>
        </div>
        <div v-else-if="!rewardsResults">
          <b-spinner variant="primary" label="Spinning" />
        </div>
      </div>
      <b-button id="claimRewardBtn" class="px-5 py-2" variant="primary" @click="claimRewardHandler" :disabled="hasNoRewards">{{ $t('views.rewards.claim_reward') }}</b-button>
      <b-tooltip v-if="!hideTooltip" target="claimRewardBtn" placement="bottom" title="Once the lock time period has expired, click here to claim your reward"></b-tooltip> 
    </div>
  </b-card>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

const DPOSStore = createNamespacedHelpers('DPOS')
const DappChainStore = createNamespacedHelpers('DappChain')

@Component({
  computed: {
    ...mapGetters([
      'getPrivateKey'
    ]),    
    ...DPOSStore.mapState([
      'rewardsResults',
      'showLoadingSpinner'
    ])
  },  
  methods: {
    ...DPOSStore.mapActions([
      'queryRewards',
      'claimRewardsAsync'
    ]),
    ...mapMutations([
      'setSuccessMsg',
      'setErrorMsg'
    ]),
    ...DPOSStore.mapMutations(['setShowLoadingSpinner'])
  }
})
export default class Rewards extends Vue {

  hideTooltip = false
  pollInterval = null

  get hasNoRewards() {
    return this.rewardsResults == "0.00"
  }

  get formattedRewardResults() {
    return this.rewardsResults.toString() + " LOOM"    
  }

  async claimRewardHandler() {
    this.hideTooltip = true
    this.setShowLoadingSpinner(true)
    try {
      await this.claimRewardsAsync()
      this.setSuccessMsg({msg: "Successfully claimed rewards!" + this.rewardsResults.toString(), forever: false})
    } catch(err) {
      this.setErrorMsg({msg: "Claiming reward failed", forever: false, report:true, cause:err})
    }
    this.setShowLoadingSpinner(false)
    this.hideTooltip = false
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

