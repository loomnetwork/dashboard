<template>
  <div class="validator-details">        
    <div class="faucet-content" style="min-height: 80vh;">
      <faucet-delegate-modal ref="delegateModalRef"
        @onDelegate="delegateHandler"  
        :locktimeTier="0" 
        :hasDelegation="delegations.length > 0"></faucet-delegate-modal>
      <redelegate-modal
        @ok="redelegateHandler"
        v-on:hide="redelegationRequest = null"
        :validators="validators"
        :originDelegation="redelegationRequest"
        :originValidator="validator">
      </redelegate-modal>
      <success-modal></success-modal>
        <main>
          <loading-spinner v-if="!finished" :showBackdrop="true"></loading-spinner>
          <div class="container mb-2 column py-3 p-3 bottom-border">
            <h1 class="h2">
              {{validator.Name }}
              <small class="text-muted" v-if="isBootstrap">bootstrap</small>
            </h1>
            <input type="text" ref="address" :value="validator.Address" tabindex='-1' aria-hidden='true' style="position: absolute; left: -9999px">
            <h6><a @click="copyAddress">{{validator.Address}} <fa :icon="['fas', 'copy']" class="text-grey" fixed-width/></a></h6>
            
            <a :href="$options.filters.validatorWebsite(validator)" target="_blank" class="text-gray">{{validator | validatorWebsite}}</a>
            <p class="lead">{{validator.Description}}</p>
          </div>
          <div class="container">
            <faucet-table :items="[validator]" :fields="fields"></faucet-table>
          </div>
          <div v-if="isReallyLoggedIn && (!isBootstrap || (isBootstrap && delegations.length))" class="delegations-panel container">
            <h6>Your delegations</h6>

            <b-table
                  show-empty
                  stacked="md"
                  :items="delegations"
                  :fields="delgationFields"
                >
                <template slot="empty" slot-scope="scope">
                <div role="alert" aria-live="polite"><div class="text-center my-2">
                  you haven't made any delegations to this validato yetr<br><br>
                   <b-button v-if="canDelegate" class="px-5 py-2" variant="primary" @click="openRequestDelegateModal" :disabled="canDelegate === false">
                    {{ $t("delegation.delegate") }}
                    </b-button>
                </div></div>
              </template>
                  <template slot="state" slot-scope="row">

                    <div v-if="row.item.state !== 1" class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">pending...</span>
                    </div>
                    {{ row.item.state | delegationState }}
                  </template>

                  <template slot="amount" slot-scope="row">
                    {{ (row.item.amount.isZero() ? row.item.updateAmount : row.item.amount) | tokenAmount }}
                  </template>
                  <template slot="lockTimeTier" slot-scope="row">
                     {{row.item.lockTimeTier | lockTimeTier }}
                  </template>
                  <template slot="unlockTime" slot-scope="row">
                    {{ row.item.lockTime | timeFromNow }}
                  </template>
                  <template slot="bonus" slot-scope="row">
                     x{{row.item.lockTimeTier | lockTimeBonus }}
                  </template>
                  <template slot="actions" slot-scope="row">
                    <b-button 
                      :disabled="row.item.state !== 1"
                      size="sm"
                      variant="outline-primary" 
                      @click="openRequestDelegationUpdateModal">
                      {{ $t("delegation.update") }}
                    </b-button>
                    <b-button v-b-tooltip 
                                          :disabled="row.item.state !== 1"
                      size="sm"
                      title="Redelegate from/to another delegator" 
                      variant="outline-info" 
                      @click="openRedelegateModal(row.item)">
                      {{ $t("delegation.redelegate") }}</b-button>
                    <b-button v-b-tooltip 
                                          :disabled="row.item.state !== 1"
                      size="sm"
                      title="Withdraw your delegated tokens"
                      variant="outline-danger" 
                      @click="openRequestUnbondModal(row.value)">
                      {{ $t("delegation.undelegate") }}</b-button>
                  </template>
                </b-table>



          </div>
        </main>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import FaucetTable from '../components/FaucetTable'
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
      'getDelegatorDelegations',
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
    { key: 'Fees', sortable: false },
  ]

  delgationFields = [
    { key: "state", label:"State"},
    { key: "amount", label:"Stake"},
    { key: "lockTimeTier", label:"Lock Tier"},
    { key: "unlockTime", label:"Unlock time"},
    { key: "bonus", label:"Reward"},
    { key: 'actions', label: 'Actions' },
  ]
  validator = {}

  delegations = []

  finished = false

  redelegationRequest = null

  get hasDelegations() {
    return this.delegations && this.delegations.length > 0
  }



  unlockTime = {
    seconds: 0,
  }

  lockTimeTiers = [
    "2 weeks",
    "3 months",
    "6 months",
    "1 year"
  ]
  // lockTime in days
  // note: This should be gotten from loom-js/dpos
  lockDays = [14,90,180,365]
  states = ["Bonding", "Bonded", "Unbounding", "Redelegating"]

  async beforeMount() {
    let name = this.$route.params.index
    if(!this.validators || this.validators.length <= 0) await this.getValidatorList()
    this.validator = this.validators.find(v => v.Name === name)
    if(this.validator === undefined) {
      this.$router.push("../validators")
    }
  }

  beforeDestroy() {
    ['refreshInterval',
    'validatorStateInterval',
    'updateLockTimeInterval'].filter(ref => ref in this).forEach(ref => clearInterval(ref))
  }

  async mounted() {

    if(this.isReallyLoggedIn) {
      await this.refreshValidatorState()
      //this.validatorStateInterval = setInterval(() => this.refreshValidatorState(), 30000)
    }
    this.finished = true
  }

  async refreshValidatorState() {
    if(this.isReallyLoggedIn) {
      try {
        this.delegations = await this.getDelegatorDelegations(this.validator.Address)
        console.log('delegation', this.delegation)
      } catch(err) {
        console.error("error while getting delegations: "+ err.mesage)
        throw err
      }
    }
  }

  async refreshDelegations() {
    if(this.isReallyLoggedIn) {
      throw new Error("not logged in")
    }
    this.delegations = await this.getDelegatorDelegations(this.validator.Address)
  }

  async delegateHandler() {
    this.refreshDelegations()
    this.$root.$emit("refreshBalances")

    // refresh validator
    this.refreshValidatorState()

    // show modal
    this.$root.$emit("bv::hide::modal", "success-modal")
    
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
    this.refreshValidatorState()
    this.$root.$emit("refreshBalances")
  }

  get isReallyLoggedIn() {
    return this.userIsLoggedIn && this.getPrivateKey
  }

  get canDelegate() {
    return this.userIsLoggedIn && 
      this.getPrivateKey && 
      this.isBootstrap === false && 
      (
        // hack around initial bonding state (no state "unbonded")
        (this.hasDelegations === false) || 
        // normal rule
        (this.hasDelegations === true && this.delegationState == 'Bonded' )
      )
  }


  // get amountDelegated() {
  //   return this.delegation && this.delegation.amount ? this.delegation.amount/10**18 : 0
  // }


  // get formatLocktime() {    
  //   if(!this.delegation.lockTime) return 0
  //   let date = new Date(this.delegation.lockTime*1000)
  //   let hours = date.getHours()
  //   let minutes = "0" + date.getMinutes()
  //   let seconds = "0" + date.getSeconds()
  //   let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
  //   return formattedTime
  // }



  get canClaimReward() {
    return this.hasDelegations && this.this.unlockTime.second <= 0
  }

  get isBootstrap() {
    return this.prohibitedNodes.includes(this.validator.Name)
  }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(this.validator.Address, '')
  }
  
  openRequestDelegationUpdateModal(delegation) {
    this.$refs.delegateModalRef.show(this.validator.Address, '', delegation.amount, delegation.lockTimeTier)
  }

  openRequestUnbondModal() {
    this.$refs.delegateModalRef.show(this.validator.Address, 'unbond')
  }
  

  openRedelegateModal(delegation) {
    this.redelegationRequest = delegation
  }

}
</script>

<style lang="scss">

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

.delegations-panel {
  .b-table.table > thead > tr > th {
    font-size: 0.8em;
    color: rgba(0, 0, 0, 0.68);
  }
}

h1 {
  margin-top: 24px;
}

.delegations-panel {
  margin-top: 24px;
}

td[data-label=Actions] > div {
  display: flex;
  >button {
    flex:1;
    margin: 0 4px;
  }
}

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
