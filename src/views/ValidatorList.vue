<template>
  <main class="validators">
    <header>
      <h1>{{ $t('views.validator_list.validators') }}</h1>
    </header>
    <div class="content" v-if="validators && validators.length > 0">
      <template v-if="isSmallDevice">
        <b-list-group>
          <b-list-group-item 
            v-for="validator in validators" :key="validator.Name"
            :disabled="!!validator.isBootstrap"
            @click="showValidatorDetail(validator)"
            >
              <h6>{{validator.Name}}</h6>
              <div class="fee"><label>Fee</label>{{validator.Fees}}</div>
              <div class="stakes"><label>Stake</label><span>{{validator.totalStaked}}</span></div>
              <div v-if="!isSmallDevice" class="status" :class="{'active': validator.Status === 'Active'}">{{validator.Status}}</div>
          </b-list-group-item>  
        </b-list-group>
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
    return this.getFormattedValidators().sort((a, b) => {
      let aValue = a.isBootstrap ? 0 : a.totalStaked 
      let bValue = b.isBootstrap ? 0 : b.totalStaked
      return parseInt(aValue) - parseInt(bValue)
    }).reverse()
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
    padding: 0.2em 1em;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    > h6 {
      flex: 1
    }
    &.disabled {
      opacity: 0.5;
    }
    .stakes {
      text-align: right;
      width: 110px;
    }
    .fee {
      flex: 0;
      font-size: 10px;
      widows: 10px;
    }
    .stakes > label {
      display: block;
      display: none;
      margin: 0;
      font-size: 12px;
      line-height: 12px;
      text-align: left;
    }
    .fee > label {
      display: inline-block;
      margin: 0;
      font-size: 10px;
      line-height: 24px;
      text-align: right;
      vertical-align: bottom;
      margin-right: 7px;
      font-weight: bold;
      color: rgba(128, 128, 128, 0.58);
    }
    .status {
      flex: 50%;
      font-size: 0.8em;
      &.active {
        color: green
      }
    }
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
