<template>
  <div class="py-4">
    
    <b-card title="Balance" class="animated zoomIn faster mb-4">

      <b-card v-if="currentAllowance && !gatewayBusy"
              bg-variant="warning"
              text-variant="white"
              header="Warning"
              class="text-center">
        <b-card-text>
          {{allowance}} LOOM awaiting transfer to plasmachain account.
          <b-btn size="sm" @click="completeDeposit">Resume Deposit</b-btn>
        </b-card-text>
      </b-card>      

      <div class="p3">
        <h6>{{ $t('views.my_account.mainnet') }}</h6>
        <h5 class="highlight">
          {{userBalance.isLoading ? 'loading' : userBalance.mainnetBalance + " LOOM"}}
          <loom-icon :color="'#f0ad4e'"/>
        </h5>
        <h6>{{ $t('views.my_account.plasmachain') }}</h6>                            
        <h5 class="highlight">
          {{userBalance.isLoading ? 'loading' : userBalance.loomBalance + " LOOM"}}
          <loom-icon :color="'#f0ad4e'"/>
        </h5>
      </div>

    </b-card>

    <b-card title="Election Cycle" class="animated zoomIn faster mb-4">
      <vm-progress type="circle" :percentage="timerValue">
        <small><strong>{{formattedTimeUntilElectionCycle}}</strong></small>
      </vm-progress>
    </b-card>

    <b-card title="Rewards" class="animated zoomIn faster mb-4">
      <h5 class="highlight">
        {{rewardsValue}}
        <loom-icon :color="'#f0ad4e'"/>
      </h5>
    </b-card>

    <b-card title="Delegations" id="delegations-container" class="animated zoomIn faster">

      <b-card v-for="(delegation, idx) in delegations" :key="'delegations' + idx" no-body class="mb-1">
        <b-card-header @click="toggleAccordion(idx)"
                       header-tag="header"
                       class="d-flex justify-content-between p-2"
                       role="tab">
          <span>{{delegation["Name"]}}</span>
          <strong>{{delegation["Amount"]}}</strong>
        </b-card-header>
        <b-collapse :id="'accordion' + idx" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <ul>
              <li>Update amount: {{delegation["Update Amount"]}}</li>
              <li>Height: {{delegation["Height"]}}</li>
              <li>Locktime: {{delegation["Locktime"]}}</li>
              <li>State: {{delegation["State"]}}</li>
            </ul>
          </b-card-body>
        </b-collapse>
      </b-card>

        <!-- <b-table :items="delegations" :busy="delegations === -1" class="mt-3" outlined>
          <div slot="table-busy" class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
        </b-table> -->

    </b-card>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import LoomIcon from '@/components/LoomIcon'
import FaucetTable from '@/components/FaucetTable'
import { getBalance, getAddress } from '@/services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

import Web3 from 'web3'
import BN from 'bn.js'
import debug from 'debug'
import { setTimeout } from 'timers'
import { formatToCrypto, sleep } from '../utils.js'

const log = debug('mobileaccount')
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')


@Component({
  components: {
    LoomIcon,
    FaucetTable
  },
  computed: {
    ...DappChainStore.mapState([
      'web3',
      'dposUser'
    ]),    
    ...DPOSStore.mapState([
      'userBalance',
      'gatewayBusy',
      'rewardsResults',
      'timeUntilElectionCycle',
      'states'
    ]) 
  },
  methods: {
    ...DPOSStore.mapActions([
      'getTimeUntilElectionsAsync',
      'queryRewards',
      'setGatewayBusy',
      'setShowLoadingSpinner'
    ])
  }
})

export default class MobileAccount extends Vue {

  delegations = []
  currentAllowance = 0

  // Election timer
  electionCycleTimer = undefined
  timerRefreshInterval = null
  formattedTimeUntilElectionCycle = null
  timeLeft = 600
  
  async mounted() {
    this.delegations = await this.getDelegations()
    this.currentAllowance = await this.checkAllowance()
    await this.queryRewards()
    await this.updateTimeUntilElectionCycle()
    this.startTimer()

  }

  async checkAllowance() {    
    const user = this.dposUser
    const gateway = user.ethereumGateway
    try {          
      const allowance = await user.ethereumLoom.allowance(this.currentMetamaskAddress, gateway.address)
      return this.web3.utils.fromWei(allowance.toString())
    } catch(err) {
      console.error("Error checking allowance", err)
      return 0
    }
  }

  async getDelegations() {

    const { amount, weightedAmount, delegationsArray } = await this.dposUser.listDelegatorDelegations()
    const candidates = await this.dposUser.listCandidatesAsync()

    return [
      {
        "Name": "Shipchain",
        "Amount": "300",
        "Update Amount": "450",
        "Height": "329",
        "Locktime": "1/11/2019",
        "State": "Bonded" 
      },
      {
        "Name": "BitFish",
        "Amount": "300",
        "Update Amount": "450",
        "Height": "329",
        "Locktime": "1/11/2019",
        "State": "Bonded" 
      },
      {
        "Name": "BlockTower",
        "Amount": "300",
        "Update Amount": "450",
        "Height": "329",
        "Locktime": "1/11/2019",
        "State": "Bonded" 
      },
      {
        "Name": "Mythos",
        "Amount": "300",
        "Update Amount": "450",
        "Height": "329",
        "Locktime": "1/11/2019",
        "State": "Bonded" 
      },                  
    ]

    return delegationsArray.filter(d => !(d.amount.isZero() && d.updateAmount.isZero()))
           .map(delegation => {
            let candidate = candidates.find(c => c.address.local.toString() === delegation.validator.local.toString())
            return { 
                    "Name": candidate.name,
                    "Amount": `${formatToCrypto(delegation.amount)}`,
                    "Update Amount": `${formatToCrypto(delegation.updateAmount)}`,
                    "Height": `${delegation.height}`,
                    "Locktime": `${new Date(delegation.lockTime * 1000)}`,
                    "State": `${this.states[delegation.state]}`,
                    _cellVariants: { Status: 'active'}
            }
    })

  }

  toggleAccordion(idx) {
    this.$root.$emit("bv::toggle::collapse", "accordion" + idx)
  }

  async completeDeposit() {
    this.setGatewayBusy(true)
    this.setShowLoadingSpinner(true)
    const tokens = new BN( "" + parseInt(this.allowance,10)) 
    const weiAmount = new BN(this.web3.utils.toWei(tokens, 'ether'), 10)
    try {
      await this.dposUser._ethereumGateway.functions.depositERC20(
        weiAmount.toString(), this.dposUser.ethereumLoom.address
      )
      this.allowance = 0
    } catch (error) {
      console.error(error)
    }
    this.$emit('refreshBalances')
    this.setGatewayBusy(false)
    this.setShowLoadingSpinner(false)
  }

  startTimer() {
    this.timerRefreshInterval = setInterval(async () => this.decreaseTimer(), 1000)
  }

  async decreaseTimer() {
    if(this.electionCycleTimer) {
      let timeLeft = parseInt(this.electionCycleTimer)      
      if(timeLeft > 0) {
        timeLeft--
        this.timeLeft = timeLeft
        this.electionCycleTimer = timeLeft.toString()
        this.showTimeUntilElectionCycle()
      } else {
        await this.updateTimeUntilElectionCycle()
      }
    }
  } 

  async updateTimeUntilElectionCycle() {
    await this.getTimeUntilElectionsAsync()
    this.electionCycleTimer = this.timeUntilElectionCycle    
  }

  showTimeUntilElectionCycle() {    
    if(this.electionCycleTimer) {
      let timeLeft = this.electionCycleTimer
      let date = new Date(null)
      date.setSeconds(timeLeft)
      let result = date.toISOString().substr(11, 8)
      this.formattedTimeUntilElectionCycle = result
    } else {
      this.formattedTimeUntilElectionCycle = ""      
    }
  }  

  get timerValue() {
    return this.timeLeft ? parseInt(this.timeLeft/600 * 100) : 0
  }

  get rewardsValue() {
    return this.rewardsResults ? (this.rewardsResults.toString() + " LOOM") : "0.00"
  }
  

}

</script>

<style lang="scss" scoped>
@import url("https://use.typekit.net/nbq4wog.css");

h3 {
  color: #02020202;
}

</style>

<style lang="scss">
  #delegations-container {
    .card-header {
      background-color: #fff;
    }
  }
</style>
