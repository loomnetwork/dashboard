<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">
      <div>        
        <main>
          <div class="container mb-5 column py-3 p-3 d-flex">
            <div v-if="loading === false && delegations.length > 0">
              <faucet-table :items="delegations" @row-clicked="showValidatorDetail"/>
            </div>
            <div v-if="loading === false && delegations.length == 0">
              <h2>{{ $t('views.my_delegations.no_delegations') }}</h2>
            </div>
          </div>
          <div v-if="loading === true">
            <loading-spinner :showBackdrop="true"></loading-spinner>
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
import FaucetSidebar from '../components/FaucetSidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { getDelegationListAsync } from '../services/dposv2Utils.js'
import { formatToCrypto, sleep } from '../utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import { log } from 'util';
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

import { initWeb3 } from '../services/initWeb3'

@Component({
  components: {
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
    FaucetSidebar,
    LoadingSpinner
  },
  methods: {
    ...DPOSStore.mapMutations([
      'setConnectedToMetamask',
      'setWeb3',
      'setCurrentMetamaskAddress'
    ]),
    ...DappChainStore.mapActions([
      'getDpos2'
    ])
  },
  computed: {
    ...mapGetters([
      'getPrivateKey'
    ]),
    ...DappChainStore.mapGetters([
      'currentChain',
      'currentRPCUrl',
    ]),
    ...DappChainStore.mapState([
      'dposUser',
    ])  
  }
})
export default class MyDelegations extends Vue {
  delegations = []
  states = ["Bonding", "Bonded", "Unbounding", "Redelegating"]
  loading = true

  async mounted() {
    this.$root.$on('initialized', async () => {
      await this.getDelegationList()
    }) 

    await this.getDelegationList()    
  }

  async refresh() {
    await this.getDpos2()
    await this.getDelegationList()
  }

  async getDelegationList() {
    this.loading = true    


    const { amount, weightedAmount, delegationsArray } = await this.dposUser.listDelegatorDelegations()

    const candidates = await this.dposUser.listCandidatesAsync()

    this.delegations = delegationsArray
      .filter(d => !(d.amount.isZero() && d.updateAmount.isZero()))
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

    this.loading = false
  }

  formatLocktime() {    
    if(!this.delegation.lockTime) return 0
    let date = new Date(this.delegation.lockTime*1000)
    let hours = date.getHours()
    let minutes = "0" + date.getMinutes()
    let seconds = "0" + date.getSeconds()
    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
    return formattedTime
  }

  showValidatorDetail(record, index) {
    this.$router.push(`/validator/${encodeURIComponent(record.Name)}`)
  }

}</script>

<style lang="scss" scoped>
@import url('https://use.typekit.net/nbq4wog.css');

body {
  overflow-y: scroll;
}

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

.faucet-with-navbar {
  main {
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
  }
}

h2 {
  color: #808080;
}

</style>
