<template>
  <div class="faucet">        
    <div class="faucet-content">
      <faucet-delegate-modal @onDelegate="delegateHandler" ref="delegateModalRef" :locktimeTier="currentLockTimeTier" :hasDelegation="hasDelegation"></faucet-delegate-modal>
      <success-modal></success-modal>
      <div>
        <main>
          <loading-spinner v-if="!finished" :showBackdrop="true"></loading-spinner>
          <div class="container mb-2 column py-3 p-3 d-flex bottom-border">
            <h1>{{validator.Name}}</h1>
            <input type="hidden" ref="address" :value="validator.Address">
            <h4><a @click="copyAddress">{{validator.Address}} <fa :icon="['fas', 'copy']" class="text-grey" fixed-width/></a></h4>
            <div v-if="userIsLoggedIn">
              <h5>
                State: <span class="highlight">{{delegationState}}</span>
              </h5>
              <h5>
                Amount Delegated: <span class="highlight">{{amountDelegated}} LOOM</span>
              </h5>
              <h5>
                Updated Amount: <span class="highlight">{{updatedAmount}} LOOM</span>
              </h5>
              <!-- Hide timelock tier for now: incorrect 1 year timelock iier -->
              <!-- <h5>
                Timelock Tier: <span class="highlight">{{lockTimeTier}}</span>
              </h5> -->
              <h5 class="mb-4">
                Timelock: <span v-if="!lockTimeExpired" class="highlight">{{locktime}}</span>
                <span v-else class="highlight">Unlocked</span>
              </h5>
            </div>
            <a :href="renderValidatorWebsite" target="_blank" class="text-gray"><u>{{validator.Website || 'No Website'}}</u></a>
            <p class="text-gray">{{validator.Description || 'No Description'}}</p>
          </div>
          <div class="container">
            <faucet-table :items="[validator]" :fields="fields"></faucet-table>
            <div v-if="!disableNode" class="row justify-content-end validator-action-container">
              <!-- <div class="col col-sm-12 col-md-3">
                <b-button id="claimRewardBtn" class="px-5 py-2" variant="primary" @click="claimRewardHandler" :disabled="!canClaimReward">Claim Reward</b-button>
                <b-tooltip target="claimRewardBtn" placement="bottom" title="Once the lock time period has expired, click here to claim your reward"></b-tooltip>
              </div> -->
              <div class="col col-sm-12 col-md-9 right-container text-right">
                <b-button id="delegateBtn" class="px-5 py-2 mx-3" variant="primary" @click="openRequestDelegateModal" :disabled="!canDelegate || (delegationState != 'Bonded' && amountDelegated != 0)">Delegate</b-button>
                <b-tooltip target="delegateBtn" placement="bottom" title="Click here to transfer tokens to this validator"></b-tooltip>
                <b-button id="undelegateBtn" class="px-5 py-2" variant="primary" @click="openRequestUnbondModal" :disabled="!canDelegate || !hasDelegation || delegationState != 'Bonded'">Un-delegate</b-button>
                <b-tooltip target="undelegateBtn" placement="bottom" title="Click here to withdraw your delegated tokens"></b-tooltip>
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
    FaucetDelegateModal,
    LoadingSpinner
  },
  computed: {
    ...mapState([
      'userIsLoggedIn'
    ]),
    ...DPOSStore.mapState([
      'prohibitedNodes'
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
    ...DappChainStore.mapActions([
      'getValidatorsAsync',
      'checkDelegationAsync',
      'claimRewardAsync'
    ])
  }
})
export default class ValidatorDetail extends Vue {
  fields = [
    { key: 'Status', sortable: false },
    { key: 'Stake', sortable: false },
    // { key: 'Weight', sortable: false },
    { key: 'Fees', sortable: false },
    // { key: 'Uptime', sortable: false },
    // { key: 'Slashes', sortable: false },
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

  async mounted() {

    this.validator = this.$route.params.info
    console.log("validator", this.validator)

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
    document.execCommand('copy');
    this.setSuccess("Address copied to clipboard")
  }

  async refresh() {
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
          pubKey: (validator.pubKey)
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
      console.log("err", err)
      this.setErrorMsg({msg: "Claiming reward failed", forever: false})
    }
    this.finished = true
  }

  get canDelegate() {
    return this.userIsLoggedIn && this.getPrivateKey
  }

  get amountDelegated() {
    return this.delegation && this.delegation.amount ? this.delegation.amount/10**18 : 0
  }

  get updatedAmount() {
    return this.delegation.updateAmount/10**18  
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
    return this.validator.Website ? this.validator.Website : "https://loomx.io/"
  }

  get canClaimReward() {
    return this.hasDelegation && this.lockTimeExpired ? true : false
  }

  // setValidatorInfo() {
  //   const index = parseInt(this.$route.query.id)

  //   const validatorForm = {
  //     Status: null,
  //     "Stake": null,
  //     "Weight %": null,
  //     "Fees": null,
  //     "Uptime": null,
  //     "Slashes": null,
  //   }

  //   if (this.validatorList !== null && index >= this.validatorList.length) {
  //     // Validator index is incorrect
  //     this.$router.push({
  //       name: 'validators',
  //     })
  //     return [validatorForm]
  //   }
  //   if (this.validatorList === null) {
  //     // Still loading
  //     return [validatorForm]
  //   }
  //   const validator = this.validatorList[index]
  //   this.validatorInfo = {
  //     Status: validator.active ? "Active" : "Inactive",
  //     "Stake": (validator.stake || '0'),
  //     "Weight %": (validator.weight || '0') + '%',
  //     "Fees": (validator.fee || '0') + '%',
  //     "Uptime": (validator.uptime || '0') + '%',
  //     "Slashes": (validator.slashes || '0') + '%',
  //     _cellVariants: validator.active ? { Status: 'active'} : undefined
  //   }

  //   this.validatorMetaData = {
  //     name: "Validator #" + (parseInt(index) + 1),
  //     description: validator.description ? validator.description : null,
  //     website: validator.website ? validator.website : null
  //   }
    
  //   if (this.canDelegate) {
  //     checkDelegationAsync(this.currentRPCUrl, this.getPrivateKey, this.validator.address)
  //     .then(res => {
  //       this.hasDelegation = true
  //     }).catch(err => {
  //       this.hasDelegation = false
  //       console.log(err)
  //     })
  //   }
  // }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(this.validator.Address, '')
  }

  openRequestUnbondModal() {
    this.$refs.delegateModalRef.show(this.validator.Address, 'unbond')
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
      color: gray;
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
