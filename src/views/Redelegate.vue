<template>
  <div class="faucet-with-navbar">    
    <div class="faucet-content">
      <div>
        <main>
          <div class="row">
            <div class="col">
              <h1>{{ $t('views.redelegate.redelegate') }}</h1>
              <div role="tablist" id="accordion">
                <b-card no-body class="mb-3">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <div class="row">
                      <div class="col">
                        <a @click="toggleAccordion1">
                          <h4>
                            <strong>
                              {{ $t('views.redelegate.from') }}
                            </strong>
                          </h4>
                        </a>
                      </div>
                      <div class="col">
                        <strong v-if="origin">
                          {{origin.Name}}
                        </strong>
                      </div>
                    </div>
                  </b-card-header>
                  <b-collapse id="accordion1" accordion="my-accordion" v-model="showAccordion1" role="tabpanel">
                    <b-card-body>
                      <faucet-table :items="validators" :fields="validatorFields" sortBy="Weight" @row-clicked="selectOrigin"></faucet-table>
                    </b-card-body>
                  </b-collapse>
                </b-card>  

                <b-card no-body class="mb-5">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <div class="row">
                      <div class="col">
                        <a @click="toggleAccordion2">
                          <h4>
                            <strong>
                              {{ $t('views.redelegate.to') }}
                            </strong>
                          </h4>
                        </a>
                      </div>
                      <div class="col">
                        <strong v-if="target">
                          {{target.Name}}
                        </strong>
                      </div>
                    </div>
                  </b-card-header>
                  <b-collapse id="accordion2" accordion="my-accordion" v-model="showAccordion2" role="tabpanel">
                    <b-card-body>
                      <faucet-table :items="validators" :fields="validatorFields" sortBy="Weight" @row-clicked="selectTarget"></faucet-table>
                    </b-card-body>
                  </b-collapse>
                </b-card>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col btn-container">
              <b-button id="redelegateBtn" class="px-5 py-2" variant="primary" @click="submitHandler">Redelegate</b-button>
              <b-tooltip class="submit-btn" target="redelegateBtn" placement="bottom" title="Redelegate from/to another delegator"></b-tooltip>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
 
</template>

<script>

import Vue from 'vue'

import { Component, Watch } from 'vue-property-decorator'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
import FaucetTable from '../components/FaucetTable'

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    FaucetTable
  },
  computed: {
    ...DPOSStore.mapState([
      "validators",
      "validatorFields"
    ])
  },
  methods: {
    ...DPOSStore.mapActions([
      "getValidatorList",
      "redelegateAsync"
    ])
  }
})
export default class MyAccount extends Vue {

  origin = {}
  target = {}

  showAccordion1 = true
  showAccordion2 = false

  async mounted() {
    if(this.validators.length <= 0) await this.getValidatorList()
  }
 
  selectOrigin(item, index) {
    this.origin = item
    this.toggleAccordion1()
  }

  selectTarget(item, index) {
    this.target = item
    this.toggleAccordion2()
  }

  toggleAccordion1() {
    this.showAccordion1 = !this.showAccordion1
  }

  toggleAccordion2() {
    this.showAccordion2 = !this.showAccordion2
  }

  async submitHandler() {
    if(!this.origin || !this.target) return
    await this.redelegateAsync()
  }

}

</script>


<style lang="scss" scoped>
  .faucet-content {
    padding: 48px 0;
  }

  .btn-container {
    display: flex;
    .submit-btn {
      margin-left: auto;
    }
  }

</style>
