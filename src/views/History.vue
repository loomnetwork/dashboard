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
                    <div id="ethereum-table" v-if="showHistoryTable"><faucet-table :items="history"></faucet-table></div>
                    <div v-else>
                      <h5>
                        No activity detected in the last <span class="highlight">{{blockOffset}}</span> blocks
                      </h5>
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
    history = null

    async mounted() {
      
      await this.fetchDappChainEvents()

      // Check if there are any cached events
      if(this.latestBlockNumber && this.cachedEvents.length > 0) {
        // Query from latest block in cache
        await this.updateCachedEvents()
      } else {
        // Query the latest 10k blocks
        await this.queryEvents()
      }
    }

    async goBackFurther() {
      if(this.blockOffset < 10000*10) this.blockOffset+= 10000
      await this.queryEvents()
    }

    async updateCachedEvents() {

      // Ensure web3 and Gateway contract exist
      if(!this.web3 ||
         !this.GatewayInstance ||
         !this.currentMetamaskAddress) return

      this.setShowLoadingSpinner(true)

      // Filter based on user's address (does not seem to work)
      // let filter = { from: this.currentMetamaskAddress }

      // Get latest mined block from Ethereum
      let blockNumber = await this.web3.eth.getBlockNumber()

      // Fetch latest events
      let events = await this.GatewayInstance.getPastEvents(
        "allEvents",
        {
          fromBlock: this.latestBlockNumber,
          toBlock: blockNumber
        }
      )

      // Filter based on event type and user address
      let results = events.filter((event) => {
        return event.returnValues.from === this.currentMetamaskAddress ||
               event.returnValues.owner === this.currentMetamaskAddress        
      }).map((event) => {
        let type = event.event === "ERC20Received" ? "Deposit" : event.event === "TokenWithdrawn" ? "Withdraw" : ""
        let amount = event.returnValues.amount || event.returnValues.value || 0 
        return {
          "Block #" : event.blockNumber,
          "Event"   : type,
          "Amount"  : formatToCrypto(amount),
          "Tx Hash" : event.transactionHash
          }
      })

      // Combine cached events with new events
      const mergedEvents = this.cachedEvents.concat(results)
        
      // Store results
      this.setLatesBlockNumber(blockNumber)
      this.setCachedEvents(mergedEvents)

      // Display trades in the UI
      this.history = mergedEvents

      this.setShowLoadingSpinner(false)

    }

    async queryEvents() {
      if(!this.web3 ||
         !this.GatewayInstance ||
         !this.currentMetamaskAddress) return

      this.setShowLoadingSpinner(true)

      // Filter based on user's address (does not seem to work)
      // let filter = { from: this.currentMetamaskAddress }
      let blockNumber = await this.web3.eth.getBlockNumber()

      // Fetch latest events

      console.log("Fetching events with offset: ", this.blockOffset)

      let events = await this.GatewayInstance.getPastEvents(
        "allEvents",
        {
          fromBlock: blockNumber-this.blockOffset,
          toBlock: blockNumber
        }
      )

      // Filter based on event type and user address
      let results = events.filter((event) => {
        return event.returnValues.from === this.currentMetamaskAddress ||
               event.returnValues.owner === this.currentMetamaskAddress        
      }).map((event) => {
        let type = event.event === "ERC20Received" ? "Deposit" : event.event === "TokenWithdrawn" ? "Withdraw" : ""
        let amount = event.returnValues.amount || event.returnValues.value || 0 
        return {
          "Block #" : event.blockNumber,
          "Event"   : type,
          "Amount"  : formatToCrypto(amount),
          "Tx Hash" : event.transactionHash
          }
      })
     
      // Store results
      this.setLatesBlockNumber(blockNumber)
      this.setCachedEvents(results)

      // Display trades in the UI
      this.history = results

      this.setShowLoadingSpinner(false)

    }

    get showHistoryTable() {
      return this.history && this.history.length > 0
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
