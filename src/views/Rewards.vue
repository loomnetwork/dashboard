<template>
  <div class="faucet-with-navbar">
    <div id="rewards" class="faucet-content">
      <div class="col-lg-8 offset-lg-2">
        <b-card class="text-center mt-5 p-md-2 p-lg-5">
          <div v-if="displayResults">
            <h4 class="mb-4">
              Unclaimed rewards: 
              <strong>
                {{this.rewardsResults.toString() + " LOOM"}}
              </strong>
            </h4>
            <b-button id="claimRewardBtn" class="px-5 py-2" variant="primary" @click="claimRewardHandler">Claim Reward</b-button>
            <b-tooltip v-if="!showLoadingSpinner" target="claimRewardBtn" placement="bottom" title="Once the lock time period has expired, click here to claim your reward"></b-tooltip>        
          </div>
          <div v-else>
            <h4>You have yet to recieve any rewards</h4>
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

  async mounted() {
    this.setShowLoadingSpinner(true)
    await this.queryRewards()
    this.setShowLoadingSpinner(false)
  }

  async claimRewardHandler() {
    this.setShowLoadingSpinner(true)
    let address = getAddress(this.getPrivateKey)
    try {
      await this.claimRewardsAsync(address)
      this.setSuccessMsg({msg: "Successfully claimed rewards!", forever: false})
    } catch(err) {
      this.$log("err", err)
      this.setErrorMsg({msg: "Claiming reward failed", forever: false})
    }
    this.setShowLoadingSpinner(false)
  }

  get displayResults() {
    return this.rewardsResults ? this.rewardsResults.toString() : ""
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

