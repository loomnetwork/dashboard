<template>
  <div class="faucet-with-navbar">
    <div id="rewards" class="faucet-content">
      <div class="col-lg-8 offset-lg-2">
        <b-card class="text-center mt-5 p-md-2 p-lg-5">
          <div v-if="displayResults">
            <h4 class="mb-4">
              {{ $t('views.rewards.unclaimed_rewards') }} 
              <strong>
                {{this.rewardsResults.toString() + " LOOM"}}
              </strong>
            </h4>
            <b-button id="claimRewardBtn" class="px-5 py-2" variant="primary" @click="claimRewardHandler">{{ $t('views.rewards.claim_reward') }}</b-button>
            <b-tooltip v-if="!hideTooltip" target="claimRewardBtn" placement="bottom" title="Once the lock time period has expired, click here to claim your reward"></b-tooltip> 
          </div>
          <div v-else>
            <h4>{{ $t('views.rewards.you_have_yet_to_receive') }}</h4>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import { getAddress } from '../services/dposv2Utils.js'

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
export default class ValidatorDetail extends Vue {

  hideTooltip = false

  async mounted() {
    this.setShowLoadingSpinner(true)
    await this.queryRewards()
    this.setShowLoadingSpinner(false)
  }

  async claimRewardHandler() {
    this.hideTooltip = true
    this.setShowLoadingSpinner(true)
    try {
      await this.claimRewardsAsync()
      this.setSuccessMsg({msg: "Successfully claimed rewards!" + this.rewardsResults.toString(), forever: false})
      await this.queryRewards()
    } catch(err) {
      this.setErrorMsg({msg: "Claiming reward failed", forever: false, report:true, cause:err})
    }
    this.setShowLoadingSpinner(false)
    this.hideTooltip = false
  }

  get displayResults() {
    if(!this.rewardsResults) return ""
    if(parseInt(this.rewardsResults) > 0) {
      return this.rewardsResults.toString()
    } else {
      return ""  
    } 
  }

}

</script>

<style lang="scss" scoped>
@import '~@/assets/scss/_mixin.scss';
@import '~@/assets/scss/_variables.scss';

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

