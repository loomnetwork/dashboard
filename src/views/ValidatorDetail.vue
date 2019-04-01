<template>
  <main class="validator">
    <loading-spinner v-if="!finished" :showBackdrop="true"></loading-spinner>
    <header>
      <h1><router-link to="../validators" style="color: inherit;">{{ $t('views.validator_list.validators') }}</router-link></h1>
    </header>
    <section class="validator-details">
      <header>
      <h1>{{validator.name }}<span> {{validator.isBootstrap ? "(bootstrap)" : ''}}</span></h1>
      <p v-if="validator.description" style="color: rgba(0, 0, 0, 0.86);font-size: 16px;margin:0">
        {{validator.description}}
      </p>
      <a :href="validator.website | url" target="_blank">{{validator.website | domain}} <fa icon="external-link-alt"/></a>
      </header>
      <dl>
        <dt>{{ $t('views.validator_detail.state') }}</dt>
        <dd>{{validator.active ? "Active" : "Inactive"}}</dd>
        <dt>Delegators Stake</dt>
        <dd>{{validator.delegatedStake | tokenAmount}}</dd>
        <dt>Total Staked</dt>
        <dd>{{validator.totalStaked | tokenAmount}}</dd>
        <dt>Fee</dt>
        <dd>{{validator.fee}}</dd>
      </dl>
    </section>
    <section v-if="userIsLoggedIn" class="user-stakes">
      <h6 v-if="!isBootstrap">{{ $t('My stakes') }} </h6>
      <p class="no-stakes" v-if="delegations.length === 0">
        {{ $t("You haven't staked with {validator} yet", {validator:validator.Name}) }}
      </p>
      <b-list-group v-if="validatorDelegations.length">
          <b-list-group-item v-for="delegation in validatorDelegations" :key="delegation.unlockTime">
            <dl>
              <dt>{{ $t('views.validator_detail.state') }}</dt>
              <dd>{{delegation.state | delegationState}}</dd>
              <dt>{{ $t('views.validator_detail.amount_delegated') }}</dt>
              <dd>{{delegation.amount | tokenAmount}}</dd>
              <dt>{{ $t('views.validator_detail.updated_amount') }}</dt>
              <dd>{{delegation.updateAmount | tokenAmount}}</dd>
              <dt>{{ $t('views.validator_detail.timelock_tier') }}</dt>
              <dd>{{delegation.lockTimeTier | lockTimeTier}}</dd>
              <dt>Unlock time</dt>
              <dd>{{delegation.lockTime | date('seconds')}}</dd>
            </dl>
            <footer class="actions">
              <b-button-group style="display: flex;">
                <b-button variant="outline-primary" :disabled="!isBootstrap && delegation.state !== 1"
                  @click="openRequestDelegationUpdateModal(delegation)"
                >{{ $t('Update') }}</b-button>
                <b-button variant="outline-primary" :disabled="delegation.state !== 1"
                  @click="openRedelegateModal(delegation)"
                >{{ $t('Redelegate') }}</b-button>
                <b-button variant="outline-primary" :disabled="!isBootstrap &&  delegation.state !== 1"
                  @click="openRequestUnbondModal(delegation)"
                >{{ $t('Undelegate') }}</b-button>
              </b-button-group>
            </footer>
          </b-list-group-item>
      </b-list-group>
      <p v-else-if="!isBootstrap" class="no-stakes">
        {{ $t("views.validator_detail.no_stakes", {name:validator.name}) }}<br/>
        <b-button class="btn-lg" v-if="!isBootstrap"
          @click="openRequestDelegateModal()"
        >{{ $t("Stake my tokens") }}</b-button>
      </p>
      <!-- dialogs -->
      <faucet-delegate-modal @onDelegate="delegateHandler" ref="delegateModalRef" :hasDelegation="hasDelegation"></faucet-delegate-modal>
      <redelegate-modal ref="redelegateModalRef" @ok="redelegateHandler"></redelegate-modal>
      <success-modal></success-modal>
    </section>
  </main>
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
import { formatToCrypto } from '@/utils.js';

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
      'delegations'
    ]),
    ...DappChainStore.mapState([
      'validators',
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
      'redelegateAsync'
    ]),
    ...DappChainStore.mapActions([
      'getValidatorsAsync',
      'claimRewardAsync',
      'getDpos2'
    ])
  }
})
export default class ValidatorDetail extends Vue {
  isSmallDevice = window.innerWidth < 600
  fields = [
    { key: 'Status' },
    { key: 'personalStake', label: 'Validator Personal Stake'},
    { key: 'delegatedStake', label: 'Delegators Stake'},
    { key: 'totalStaked', label: 'Total Staked'},
    // { key: 'votingPower', label: 'Reward Power'},
    { key: 'Fees', sortable: false },
  ]
  validatorName = ""

  hasDelegation = false

  finished = false

  locktime = 0

  unlockTime = {
    seconds: 0,
  }

  lockTimeTiers = [
    "2 weeks",
    "3 months",
    "6 months",
    "1 year"
  ]

  lockDays = [14,90,180,365]

  states = ["Bonding", "Bonded", "Unbounding", "Redelegating"]

  async beforeMount() {
    this.validatorName = this.$route.params.index
  }

  /**
   * @returns {IValidator && ICandidate}
   */
  get validator() {
    const v = this.validators.find(v => v.name === this.validatorName)
    // todo add state.loadingValidators:boolean
    if(v === undefined) {
      this.$router.push("../validators")
    }
    return v
  }

  get validatorDelegations() {
    const validator = this.validator
    return validator ? this.delegations.filter(d => d.validatorStr === validator.address) : []
  }

  async mounted() {
    this.finished = true
  }

  async delegateHandler() {
    this.$root.$emit("refreshBalances")
    // show success modal
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
    // plugin listens to actions and refreshes accordingly
    return false
    this.$root.$emit("refreshBalances")
  }

  get isReallyLoggedIn() {
    return this.userIsLoggedIn && this.getPrivateKey
  }

  get canClaimReward() {
    return this.hasDelegation && this.this.unlockTime.second <= 0
  }

  get isBootstrap() {
    return this.prohibitedNodes.includes(this.validator.name)
  }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(this.validator.address, '')
  }
  
  openRequestDelegationUpdateModal(delegation) {
    this.$refs.delegateModalRef.show(
      this.validator.address, 
      '',
      formatToCrypto(delegation.amount), 
      delegation.lockTimeTier)
  }

  openRequestUnbondModal() {
    this.$refs.delegateModalRef.show(this.validator.address, 'unbond')
  }
  
  openRedelegateModal(delegation) {
    this.$refs.redelegateModalRef.show(delegation)
  }

}
</script>

<style lang="scss">
@import url('https://use.typekit.net/nbq4wog.css');


main.validator {
  // for the "stake my tokens button"
  padding-bottom: 82px;
  // ther should be global class for page titles
  > header > .back {
    position: absolute;
    left: 0;
  }
  > header > h1 {
    color: #5246d5;
    font-size: 1.35em;
    text-align: center;
    margin: 16px -14px 0;
    font-weight: normal;
    border-bottom: 1px solid #ededed;
    padding-bottom: 16px;
  }


  dl {
    display: flex;
    flex-wrap: wrap;
    dt,dd {
      flex: 50%;
      border-bottom: 1px solid rgba(0, 0, 0, 0.09);
      line-height: 24px;
      padding: 8px 0 8px;
      margin: 0;
    }
    dt {
      font-weight: normal
    }
    dd {
      font-weight: 500;
      text-align: right;
    }
  }

  .validator-details {
    margin: 0 -15px;
    padding: 15px;
    background: #fff;
    border-bottom: 1px solid #dfdfdf;
    > header {
      margin-bottom: 5px;
      padding-bottom: 5px;
      > h1 {
      color: black;
      font-size: 1.8em;
      }
      
    }

  }

  .user-stakes {
    margin-top: 15px;
    .no-stakes {
      text-align: center;
      button {
        background-color: #5448da;
        border-color: #5448da;
            margin-top: 15px;
      }
    }
    > footer {
      position: fixed;
      bottom: 0;
      padding: 8px;
      left: 0;
      right: 0;
      text-align: center;
      background: #00bcd47d;
      box-shadow: 0px -1px 5px grey;
      > button {
        background-color: #5448da;
        border-color: #5448da
      }
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
