<template>
  <div class="faucet">        
    <div class="faucet-content">
      <faucet-delegate-modal @onDelegate="delegateHandler" ref="delegateModalRef" :locktimeTier="currentLockTimeTier" :hasDelegation="hasDelegation"></faucet-delegate-modal>
      <redelegate-modal ref="redelegateModalRef"
                        @ok="redelegateHandler"
                        :hasDelegation="hasDelegation"
                        :delegation="delegation"
                        :validators="validators"
                        :originValidator="validator">
      </redelegate-modal>
      <success-modal></success-modal>
      <div>
        <main>
          <loading-spinner v-if="!finished" :showBackdrop="true"></loading-spinner>
          <div class="container mb-2 column py-3 p-3 d-flex bottom-border">
            <h1>
              {{validator.Name }}
              <span> {{isBootstrap ? "(bootstrap)" : ''}}</span>
            </h1>
            <input type="text" ref="address" :value="validator.Address" tabindex='-1' aria-hidden='true' style="position: absolute; left: -9999px">
            <h4><a @click="copyAddress">{{validator.Address}} <fa :icon="['fas', 'copy']" class="text-grey" fixed-width/></a></h4>
            <div v-if="userIsLoggedIn && !validator.isBootstrap">
              <h5>
                {{ $t('views.validator_detail.state') }} <span class="highlight">{{delegationState}}</span>
              </h5>
              <h5>
                {{ $t('views.validator_detail.amount_delegated') }} <span class="highlight">{{ $t('views.validator_detail.amount_delegated_loom', {amountDelegated:amountDelegated}) }}</span>
              </h5>
              <h5>
                {{ $t('views.validator_detail.updated_amount') }} <span class="highlight">{{ $t('views.validator_detail.updated_amount_loom', {updatedAmount:updatedAmount}) }}</span>
              </h5>
              <!-- Hide timelock tier for now: incorrect 1 year timelock iier -->
              <!-- <h5>
                {{ $t('views.validator_detail.timelock_tier') }} <span class="highlight">{{lockTimeTier}}</span>
              </h5> -->
              <h5 class="mb-4">
                {{ $t('views.validator_detail.timelock') }} <span v-if="!lockTimeExpired" class="highlight">{{locktime}}</span>
                <span v-else class="highlight">{{ $t('views.validator_detail.unlocked') }}</span>
              </h5>
            </div>
            <a :href="renderValidatorWebsite" target="_blank" class="text-gray"><u>{{validator.Website || 'No Website'}}</u></a>
            <p class="text-gray">{{validator.Description || 'No Description'}}</p>
          </div>
          <div class="container">
            <faucet-table :items="[validator]" :fields="fields"></faucet-table>
            <div class="row justify-content-end validator-action-container">
              <!-- <div class="col col-sm-12 col-md-3">
                <b-button id="claimRewardBtn" class="px-5 py-2" variant="primary" @click="claimRewardHandler" :disabled="!canClaimReward">{{ $t('views.rewards.claim_reward') }}</b-button>
                <b-tooltip target="claimRewardBtn" placement="bottom" title="Once the lock time period has expired, click here to claim your reward"></b-tooltip>
              </div> -->
              <div v-if="!isBootstrap" class="col col-sm-12 col-md-9 right-container text-right">
                <b-button id="delegateBtn" class="px-5 py-2" variant="primary" @click="openRequestDelegateModal" :disabled="!canDelegate || (delegationState != 'Bonded' && amountDelegated != 0)">Delegate</b-button>
                <b-tooltip target="delegateBtn" placement="bottom" title="Transfer tokens to this validator"></b-tooltip>
                <b-button id="undelegateBtn" class="px-5 py-2 mx-3" variant="primary" @click="openRequestUnbondModal" :disabled="!canDelegate || !hasDelegation || delegationState != 'Bonded'">Un-delegate</b-button>
                <b-tooltip target="undelegateBtn" placement="bottom" title="Withdraw your delegated tokens"></b-tooltip>
                <div v-if="!isProduction">
                  <b-button id="redelegateBtn" class="px-5 py-2" variant="primary" @click="openRedelegateModal" :disabled="!hasDelegation || !canDelegate || (delegationState != 'Bonded' && amountDelegated != 0)">Redelegate</b-button>
                  <b-tooltip target="redelegateBtn" placement="bottom" title="Redelegate from/to another delegator"></b-tooltip>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import ApiClient from '../services/faucet-api'
import { Component, Watch } from 'vue-property-decorator'
import FaucetTable from '../components/FaucetTable'
import FaucetHeader from '../components/FaucetHeader'
import FaucetFooter from '../components/FaucetFooter'
import LoadingSpinner from '../components/LoadingSpinner'
import SuccessModal from '../components/modals/SuccessModal'
import RedelegateModal from '../components/modals/RedelegateModal'
import FaucetDelegateModal from '../components/modals/FaucetDelegateModal'
import { getAddress } from '../services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
    SuccessModal,
    RedelegateModal,
    FaucetDelegateModal,
    LoadingSpinner
  },
  computed: {
    ...mapState([
      'userIsLoggedIn'
    ]),
    ...DPOSStore.mapState([
      'prohibitedNodes',
      'validators'
    ]),
    ...mapGetters([
      'getPrivateKey'
    ]),
    ...DappChainStore.mapGetters([
      'currentChain',
      'currentRPCUrl',
    ])
  },
  methods: {
    ...mapActions([
      'setSuccess'
    ]),
    ...mapMutations([
      'setErrorMsg'
    ]),
    ...DPOSStore.mapActions([
      'getValidatorList',
      'redelegateAsync'
    ]),
    ...DappChainStore.mapActions([
      'getValidatorsAsync',
      'checkDelegationAsync',
      'claimRewardAsync',
      'getDpos2'
    ])
  }
})
export default class ValidatorDetail extends Vue {
  fields = [
    { key: 'Status' },
    { key: 'personalStake', label: 'Validator Personal Stake'},
    { key: 'delegatedStake', label: 'Delegators Stake'},
    { key: 'totalStaked', label: 'Total Staked'},
    // { key: 'votingPower', label: 'Reward Power'},
    { key: 'Fees', sortable: false },
  ]
  validator = {}

  hasDelegation = false
  delegation = {}

  finished = false
  lockTimeExpired = false
  currentLockTimeTier = 0
  locktime = 0

  refreshInterval = null
  
  lockTimeTiers = [
    "2 weeks",
    "3 months",
    "6 months",
    "1 year"
  ]

  states = ["Bonding", "Bonded", "Unbounding"]
  isProduction = window.location.hostname === "dashboard.dappchains.com"

  async beforeMount() {
    let name = this.$route.params.index
    if(!this.validators || this.validators.length <= 0) await this.getValidatorList()
    this.validator = this.validators.find(v => v.Name === name)
    if(this.validator === undefined) {
      this.$router.push("../validators")
    }
  }

  async mounted() {

    if(this.canDelegate) {
      try {
        this.delegation = await this.checkDelegationAsync({validator: this.validator.pubKey})
        this.checkHasDelegation()      
      } catch(err) {
        this.hasDelegation = false     
      }
    }
    if(this.hasDelegation && this.delegation.lockTime > 0) {
      this.refreshInterval = setInterval(() => this.updateLocktime(), 1000)      
    }    

    this.finished = true

  }

  async delegateHandler() {
    this.delegation = await this.checkDelegationAsync({validator: this.validator.pubKey})
    this.checkHasDelegation()
    this.currentLockTimeTier = this.delegation.lockTimeTier

    // show modal
    this.$root.$emit("bv::hide::modal", "success-modal")

  }

  checkHasDelegation() {
    this.hasDelegation = this.delegation.amount.toString() != 0
  }

  updateLocktime() {
    let tl = parseInt(this.delegation.lockTime)
    let lt = new Date(tl*1000).getTime()
    // let lt = new Date("Jan 5, 2021 15:37:25").getTime()
    let now = new Date().getTime()
    let distance = lt - now

    let days = Math.floor(distance / (1000 * 60 * 60 * 24))
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((distance % (1000 * 60)) / 1000)

    this.locktime = days + "d " + hours + "h " + minutes + "m " + seconds + "s "
    this.lockTimeExpired = this.checkLockTime(lt)

  }

  checkLockTime(locktime) {
    return locktime < new Date().getTime() ? true : false
  }

  copyAddress() {
    this.$refs.address.select();    
    const successful = document.execCommand('copy');
    if (successful) {
        this.setSuccess("Address copied to clipboard")
    }
    else {
        this.setSuccess("Somehow copy  didn't work...sorry")
    }
  }

  async refresh() {
    await this.getDpos2()
    this.getValidators()
  }

  async getValidators() {
    try {
      const validators = await this.getValidatorsAsync()
      if (validators.length === 0) {
        return null
      }
      const validatorList = []
      for (let i in validators) {
        const validator = validators[i]
        validatorList.push({
          Name: "Validator #" + (parseInt(i) + 1),
          Address: validator.address,
          Status: validator.active ? "Active" : "Inactive",
          Stake: (validator.stake/100 || '0'),
          Weight: (validator.weight || '0') + '%',
          Fees: (validator.fee || '0') + '%',
          Uptime: (validator.uptime || '0') + '%',
          Slashes: (validator.slashes || '0') + '%',
          Description: (validator.description) || null,
          Website: (validator.website) || null,
          _cellVariants: validator.active ? { Status: 'active'} : undefined,
          pubKey: (validator.pubKey),
          personalStake: validator.personalStake,
          delegatedStake: validator.delegatedStake,
        })
      }
      commit("setValidators", validatorList)
      return validatorList
    } catch(err) {
      this.$log(err, "")
      dispatch("setError", "Fetching validators failed", {root: true})
    }
  }

  async claimRewardHandler() {
    this.finished = false
    let address = getAddress(this.getPrivateKey)
    try {
      await this.claimRewardAsync(address)
      this.setSuccess("Successfully claimed rewards!")
    } catch(err) {
      console.error("Claiming reward failed", err)
      this.setErrorMsg({msg: "Claiming reward failed", forever: false})
    }
    this.finished = true
  }

  async redelegateHandler() {
  }

  get canDelegate() {
    return this.userIsLoggedIn && this.getPrivateKey
  }

  get amountDelegated() {
    return this.delegation && this.delegation.amount ? this.delegation.amount/10**18 : 0
  }

  get updatedAmount() {
    return this.delegation && this.delegation.updateAmount ? this.delegation.updateAmount/10**18 : 0
  }

  get delegationState() {
    return this.states[this.delegation.state]
  }

  get lockTimeTier() { 
    return this.lockTimeTiers[this.delegation.lockTimeTier]
  }

  get disableNode() {
    return this.prohibitedNodes.indexOf(this.validator.Name) > -1 ? true : false
  }

  get formatLocktime() {    
    if(!this.delegation.lockTime) return 0
    let date = new Date(this.delegation.lockTime*1000)
    let hours = date.getHours()
    let minutes = "0" + date.getMinutes()
    let seconds = "0" + date.getSeconds()
    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
    return formattedTime
  }

  get renderValidatorWebsite() {
    if(!this.validator.Website) return "https://loomx.io/"
    if(this.validator.Website.includes("http")) {
      return this.validator.Website
    } else {
     return "https://" + this.validator.Website
    }
  }

  get canClaimReward() {
    return this.hasDelegation && this.lockTimeExpired ? true : false
  }

  get isBootstrap() {
    return this.prohibitedNodes.includes(this.validator.Name)
  }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(this.validator.Address, '')
  }

  openRequestUnbondModal() {
    this.$refs.delegateModalRef.show(this.validator.Address, 'unbond')
  }

  openRedelegateModal() {
    let index = this.$route.params.index
    this.$refs.redelegateModalRef.show(this.validator.Address)
    // this.$router.push({
    //   path: '/redelegate',
    //   params: {
    //     index
    //   }
    // })
  }

}</script>

<style lang="scss">
@import url('https://use.typekit.net/nbq4wog.css');

$theme-colors: (
  //primary: #007bff,
  primary: #02819b,
  secondary: #4bc0c8,
  success: #5cb85c,
  info: #5bc0de,
  warning: #f0ad4e,
  danger: #d9534f,
  light: #f0f5fd,
  dark: #122a38
);

.faucet {
  main {
    margin-left: 0;
    min-height: 620px;
    .bottom-border {
      border-bottom: 2px solid lightgray;
    }
  }
  .faucet-content {
    .column {
      flex-direction: column;
    }
    h4, h1 {
      color: #6e6f96;
    }
    h1 {
      a {
        svg {
          font-size: 24px;
          position: relative;
          bottom: 4px;
        }
      }
    }
    .text-gray {
      color: gray;
    }
    .bottom-border {
      border-bottom: 2px solid lightgray;
    }
  }
}

.loading-backdrop {
  position: absolute;
  display: flex;
  align-content: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  background-color: rgba(255,255,255,0.8);
  z-index: 999;
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
