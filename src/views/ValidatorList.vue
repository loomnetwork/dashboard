<template>
  <main class="validators">
    <header>
      <h1>{{ $t('views.validator_list.validators') }}</h1>
    </header>
    <div class="content" v-if="validators && validators.length > 0">
      <p><fa icon="info-circle" fixed-width /> {{ $t("Staking is disabled on bootstrap validators.")}}</p>
      <template v-if="isSmallDevice">
        <b-list-group>
          <b-list-group-item class="flex-column align-items-start" 
            :class="{disabled:validator.isBoostrap}"
            v-for="validator in validators" :key="validator.Name">
            <header class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">{{validator.Name}}</h5>
              <small :class="{'active': validator.Status === 'Active'}">{{validator.Status}}</small>
            </header>
            <dl>
              <dt>Fees</dt>
              <dd>{{validator.Fees}}</dd>
              <dt>Total Stakes</dt>
              <dd>{{validator.totalStaked}}</dd>
              <dt>Your Stakes</dt>
              <dd>0.00</dd>
            </dl>
            <footer>
              <b-button size="sm" variant="outline-primary">more</b-button>
              <b-button size="sm" variant="outline-primary">Stake</b-button>
            </footer>
          </b-list-group-item>  
        </b-list-group>
        <b-card v-for="validator in validators" :key="validator.Name" :title="validator.Name">
          <b-card-sub-title class="mb-2" :class="{'node-active': validator.Status === 'Active'}">{{validator.Status}}</b-card-sub-title>
          <b-card-text>
            <dl>
              <dt>Fees</dt>
              <dd>{{validator.Fees}}</dd>
              <dt>Total Stakes</dt>
              <dd>{{validator.totalStaked}}</dd>
              <dt>Your Stakes</dt>
              <dd>0.00</dd>
            </dl>
          </b-card-text>
        </b-card>
      </template>
      <template v-else>
        <faucet-table :items="validators" :fields="validatorFields" sortBy="Weight" :rowClass="validatorCssClass" @row-clicked="showValidatorDetail"></faucet-table>
      </template>
    </div>
    <div class="container mb-5 column py-3 p-3 d-flex" v-else>            
      <loading-spinner :showBackdrop="true"></loading-spinner>
    </div>
  </main>
</template>

<script>
import Vue from 'vue'
import ApiClient from '../services/faucet-api'
import { Component, Watch } from 'vue-property-decorator'
import FaucetTable from '../components/FaucetTable'
import LoadingSpinner from '../components/LoadingSpinner'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

import { DPOSUser, CryptoUtils, LocalAddress } from "loom-js";


@Component({
  components: {
    FaucetTable,
    LoadingSpinner,
  },
  computed: {
    ...DPOSStore.mapState([
      'validatorFields'
    ])
  },
  methods: {
    ...mapMutations([
      'setErrorMsg'
    ]),
    ...DPOSStore.mapGetters([
      'getFormattedValidators'
    ])
  }
})
export default class ValidatorList extends Vue {
  isSmallDevice = window.innerWidth < 600

  get validators() {
    return this.getFormattedValidators()
  }
  /**
   * adds class bootstrap node if is bootstrap
   */
  validatorCssClass( item, type) {
    return item.isBoostrap ? ['boostrap-validator'] : []
  } 

  showValidatorDetail(record, index) {
    this.$router.push(`/validator/${encodeURIComponent(record.Name)}`)
  }
}
</script>

<style lang="scss">

main.validators {
  // ther should be global class for page titles
  header > h1 {
    color: #5246d5;
    font-size: 1.35em;
    text-align: center;
    margin: 16px -14px;
    font-weight: normal;
    border-bottom: 1px solid #ededed;
    padding-bottom: 16px;
  }

  .list-group-item {
      padding-top: 16px;
    > header {
      margin-bottom: 4px;

    }
    .active {
        color: green
    }
    > footer {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
      > button {
        width: 25%;
        margin-left: 4px 
      }
    }
  }


  .card {
    margin: 16px 0;

    .active {
      color: green
    }
  }
  .card-title {
    font-size: 1.1em;
  }
  dl {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  dt,dd {
    flex: 50%;
    margin: 0;
    border-top: 1px solid #ededed;
    padding: 4px 0;
  }
  dt {
    font-size: 0.8em;
    line-height: 24px;
    font-weight: normal;
  }
  dd {
    font-size: 1em;
    line-height: 24px;
    text-align: right;
    font-weight: normal;
    color: black;
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
