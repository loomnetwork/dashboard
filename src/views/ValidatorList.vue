<template>
  <div class="faucet">
    <div class="faucet-content">
      <div>
        <main>
          <div class="container mb-5 column py-3 p-3 d-flex" v-if="validatorList !== null && validatorList.length > 0">
            <h1>Validators</h1>
            <faucet-table :items="validatorList" :fields="fields" sortBy="Stake" sortDesc @row-clicked="showValidatorDetail"></faucet-table>
          </div>
          <div v-else-if="validatorList !== null && validatorList.length == 0">
            No validators available, please try again later
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
    { key: 'Stake', sortable: true },
    // { key: 'Weight', sortable: true },
    { key: 'Fees', sortable: true },
    // { key: 'Uptime', sortable: true },
    // { key: 'Slashes', sortable: true },
  ]
  validatorList = null

  async mounted() {
    await this.refresh()
  }

  async refresh() {
    this.validatorList = await this.getValidatorList()
  }

  // async getValidatorList() {
  //   try {
  //     const validators = await this.getValidatorsAsync()
  //     if (validators.length === 0) {
  //       return null
  //     }
  //     const validatorList = []
  //     for (let i in validators) {
  //       const validator = validators[i]
  //       validatorList.push({
  //         Name: "Validator #" + (parseInt(i) + 1),
  //         Address: validator.address,
  //         Status: validator.active ? "Active" : "Inactive",
  //         Stake: (validator.stake || '0'),
  //         Weight: (validator.weight || '0') + '%',
  //         Fees: (validator.fee || '0') + '%',
  //         Uptime: (validator.uptime || '0') + '%',
  //         Slashes: (validator.slashes || '0') + '%',
  //         Description: (validator.description) || null,
  //         Website: (validator.website) || null,
  //         _cellVariants: validator.active ? { Status: 'active'} : undefined,
  //         pubKey: (validator.pubKey)
  //       })
  //     }
  //     this.setValidators(validatorList)
  //     return validatorList
  //   } catch(err) {
  //     this.setErrorMsg('Fetch Validator List Failed')
  //     console.log(err)
  //     return null
  //   }
  // }

  showValidatorDetail(record, index) {
    this.$router.push({
      name: 'validatorDetail',
      params: {
        info: record
      }
    })
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
  }
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
