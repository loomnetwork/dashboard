<template>
  <div class="faucet">
    <div class="faucet-content">
      <div>
        <main>
          <div class="container mb-5 column py-3 p-3 d-flex" v-if="validators !== null && validators.length > 0">
            <h1>{{ $t('views.validator_list.validators') }}</h1>
            <p><fa icon="info-circle" fixed-width /> Staking is disabled on bootstrap validators.</p>
            <faucet-table :items="validators" :fields="fields" sortBy="Weight" :rowClass="validatorCssClass" @row-clicked="showValidatorDetail"></faucet-table>
          </div>
          <div v-else-if="validators !== null && validators.length == 0">
            <h2>
              {{ $t('views.validator_list.no_validators_available_please_try') }}
            </h2>
          </div>
          <div class="container mb-5 column py-3 p-3 d-flex" v-else>            
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
import LoadingSpinner from '../components/LoadingSpinner'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

import { DPOSUser, CryptoUtils, LocalAddress } from "loom-js";

@Component({
  components: {
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
    LoadingSpinner,
  },
  computed: {
    ...DPOSStore.mapState([
      'validators'
    ])
  },
  methods: {
    ...mapMutations([
      'setErrorMsg'
    ]),
    ...DPOSStore.mapMutations([
      'setValidators'
    ]),
    ...DPOSStore.mapActions([
      'getValidatorList'
    ]),
    ...DappChainStore.mapActions([
      'getValidatorsAsync'
    ])
  }
})
export default class ValidatorList extends Vue {
  fields = [
    { key: 'Name', sortable: true },
    { key: 'Status', sortable: true },
    { key: 'delegationsTotal', sortable: true , label: 'Delegations Total'},
    { key: 'votingPower', sortable: true , label: 'Voting Power'},
    // { key: 'Weight', sortable: true },
    { key: 'Fees', sortable: true },
    // { key: 'Uptime', sortable: true },
    // { key: 'Slashes', sortable: true },
  ]

  async mounted() {
    await this.refresh()
  }

  async refresh() {
    await this.getValidatorList()
  }

  /**
   * adds class bootstrap node if is bootstrap
   */
  validatorCssClass( item, type) {
    console.log(34943034)
    return item.isBoostrap ? ['boostrap-validator'] : []
  } 

  showValidatorDetail(record, index) {
    this.$router.push(`/validator/${index}`)
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
    h4, h2, h1 {
      color: gray;
    }
    th[aria-colindex="3"], td[aria-colindex="3"] {
      text-align: right !important;
    }
    th[aria-colindex="4"], td[aria-colindex="4"] {
      text-align: right !important;
    }
    #faucet-table.table tbody tr td.table-danger {
      opacity: 0.5;
    }
    #faucet-table.table tbody tr td.table-danger ~ td {
      opacity: 0.5
    }
  }


}
  body {
    overflow-y: scroll;
  }
</style>
