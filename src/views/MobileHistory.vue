<template>

  <div class="py-4">

    <b-card title="Ethereum events" id="history-items-container" class="mb-3">

      <div v-if="showHistoryTable">
        <b-card v-for="(item, idx) in history" :key="'item' + idx" no-body class="mb-1">
          <b-card-header @click="toggleAccordion(idx)"
                        header-tag="header"
                        class="d-flex justify-content-between p-2"
                        role="tab">
            <span>{{item["Event"]}}</span>
            <strong>{{item["Amount"]}}</strong>
          </b-card-header>
          <b-collapse :id="'history-item' + idx" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <ul>
                <li>
                  <strong class="block-confirmation-msg animated flash slow infinite">
                    Blocks confirmations: {{latestBlockNumber - item["Block #"]}}
                  </strong>
                </li>
                <li>Block #: {{item["Block #"]}}</li>
                <li>Amount: {{item["Amount"]}}</li>
                <li>Tx Hash: {{item["Tx Hash"]}}</li>
              </ul>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
      <div v-else>
        <p>
          No activity detected in the last <span class="highlight">{{blockOffset}}</span> blocks.
          To search for events further back, please <a class="query-past-events" @click="goBackFurther">click here</a>
        </p>
        <small>Or head over to the <router-link to="/validators">validators page</router-link> to get started</small>                    
      </div>

    </b-card>

    <b-card title="DappChain events" id="history-items-container" class="mb-3">

      <div v-if="showDappChainHistoryTable">
        <b-card v-for="(item, idx) in dappChainEvents" :key="'item' + idx" no-body class="mb-1">
          <b-card-header @click="toggleAccordion(idx)"
                        header-tag="header"
                        class="d-flex justify-content-between p-2"
                        role="tab">
            <span>{{item["Event"]}}</span>
            <strong>{{item["Amount"]}}</strong>
          </b-card-header>
          <b-collapse :id="'history-item' + idx" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <ul>
                <li>Block #: {{item["Block #"]}}</li>
                <li>Amount: {{item["Amount"]}}</li>
                <li>Tx Hash: {{item["Tx Hash"]}}</li>
              </ul>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
      <div v-else>
        <p>
          No activity detected.    
        </p>
        <small>Or head over to the <router-link to="/validators">validators page</router-link> to get started</small>                    
      </div>

    </b-card>

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

    pollInterval = null
    pollingBlockNumber = 0

    async mounted() {

      await this.refresh()
      this.pollLatestBlockNumber()

    }

    async refresh() {
      
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

    destroyed() {
      if(this.timerRefreshInterval) clearInterval(this.timerRefreshInterval)          
    }

    pollLatestBlockNumber() {
      this.pollInterval = setInterval(async () => {
        this.refresh()
      }, 5000)
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

    toggleAccordion(idx) {
      this.$root.$emit("bv::toggle::collapse", "history-item" + idx)
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
  #history-items-container {
    .card-header {
      background-color: #fff;
    }
  }
  .block-confirmation-msg {
    color: #f04e4e;
  }  
</style>