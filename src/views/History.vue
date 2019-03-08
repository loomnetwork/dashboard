<template>
  <div class="faucet">
    <div class="faucet-content">
      <div class="container mb-5 column py-3 p-3 d-flex">
        <h1 class="my-4">{{ $t('views.history.your_history') }}</h1>
          <b-card no-body class="mb-3">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <a v-b-toggle.accordion3>
                <h4 class="tab-heading">
                  <strong>
                    <span>Ethereum (Gateway) events</span> 
                  </strong>                        
                </h4>
              </a>              
            </b-card-header>
            <b-collapse :visible="showHistoryTable" id="accordion3" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div class="row">
                  <div class="col">
                    <div id="ethereum-table" class="faucet-table">
                        <b-table
                          responsive
                          table-active="table-active"
                          tr-class="spacer"
                          :busy="loadingEthHistory" 
                          :items="getEthHistory"
                          :fields="ethereumFields" >
                          <template slot="event" slot-scope="row">
                            {{ $t(row.item.event) }}
                          </template>
                          <template slot="amount" slot-scope="row">
                            {{ row.item.returnValues.amount || row.item.returnValues.value | weiToToken }}
                          </template>
                          <template slot="transactionHash" slot-scope="row">
                            <a class="hash" target="_blank" :href="'https://etherscan.io/tx/' + row.item.transactionHash" :title="row.item.transactionHash">{{ row.item.transactionHash }}</a>
                          </template>
                          <template slot="empty">
                            <h5>
                              No activity detected in the last <span class="highlight">{{blockOffset}}</span> blocks
                            </h5>
                          </template>         
                        <div slot="table-busy" class="text-center">
                          <b-spinner class="align-middle" />
                          <strong>Loading...</strong>
                        </div>
                      </b-table>
                    </div>
                    <div>
                      <h6>To search for events further back, please <a class="query-past-events" @click="goBackFurther">click here</a></h6>
                      <small>Head over to the <router-link to="/validators">validators page</router-link> to get started</small>
                    </div>    
                  </div>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>


          <b-card no-body class="mb-3">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <a v-b-toggle.accordion4>
                <h4 class="tab-heading">
                  <strong>
                    <span>DappChain events</span>
                  </strong>                        
                </h4>
              </a>              
            </b-card-header>
            <b-collapse id="accordion4" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div class="row">
                  <div class="col">
                    <div v-if="showDappChainHistoryTable"><faucet-table :items="dappChainEvents"></faucet-table></div>
                    <div v-else>
                      <h5>
                        No activity detected
                      </h5>
                      <small>Head over to the <router-link to="/validators">validators page</router-link> to get started</small>
                    </div>              
                  </div>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>

      </div>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue'
  import { Component } from 'vue-property-decorator'
  import FaucetTable from '../components/FaucetTable'
  import { mapGetters, mapState, mapActions, mapMutatioins, createNamespacedHelpers } from 'vuex'

  import ApiClient from '../services/api'
  import { formatToCrypto } from '@/utils'
  import { isIP } from 'net'

  const DappChainStore = createNamespacedHelpers('DappChain')
  const DPOSStore = createNamespacedHelpers('DPOS')

  @Component({
    components: {
      FaucetTable
    },
    computed: {
     ...DappChainStore.mapState([
       "web3",
       "GatewayInstance"
     ]),
     ...DPOSStore.mapGetters({
       latestBlockNumber: "getLatestBlockNumber",
       cachedEvents: "getCachedEvents"
     }),
     ...DPOSStore.mapState([
       "history",
       "currentMetamaskAddress",
       "showLoadingSpinner",
       "dappChainEventUrl",
       "dappChainEvents"
     ])
    },
    methods: {
      ...DPOSStore.mapMutations([
        "setShowLoadingSpinner",
        "setLatesBlockNumber",
        "setCachedEvents"
      ]),
      ...DPOSStore.mapActions([
        "fetchDappChainEvents"
      ])
    }
  })
  export default class History extends Vue {

    // "ERC20Received" = Deposit?
    // "TokenWithdrawn" = Withdraw?
    blockOffset = 10000

    ethereumFields = [
      {key:"blockNumber",label:"Block #"},
      {key:"event",label:"Event"},
      {key:"amount",label:"Amount"},
      {key:"transactionHash",label:"Tx Hash"},
    ]

    loadingEthHistory = false

    getEthHistory() {
      this.loadingEthHistory = true
      this.history.then(() => this.loadingEthHistory = false)
      return this.history
    }

    async __mounted() {
      await this.fetchDappChainEvents()
    }

    async goBackFurther() {
      if(this.blockOffset < 10000*10) this.blockOffset+= 10000
      await this.queryEvents()
    }

    get showDappChainHistoryTable() {
      return this.dappChainEvents && this.dappChainEvents.length > 0
    }

  }
  
  </script>

<style lang="scss" scoped>
  .dropdown-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .query-past-events {
    color: #007bff !important;
    cursor: pointer;
  }
  .tab-heading {
    color: gray;
    margin: 0px;
    padding: 12px 1.25rem;
  }  

  .hash {
        display: block;
    max-width: 300px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
<style lang="scss">
  // Uncomment to show Ethereum logo
  // #ethereum-table {
  //   table {
  //     tbody tr {
  //       position: relative;
  //     }

  //     tbody td:first-child::before {
  //       content: "";
  //       background-image: url("../assets/ethereum-icon.svg");
  //       background-size: contain;
  //       width: 24px;
  //       height: 24px;
  //       position: absolute;
  //       display: block;
  //       left: -4px;
  //     }  
  //   }
  // }
</style>
