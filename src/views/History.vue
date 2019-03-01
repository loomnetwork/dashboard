<template>
  <div class="faucet">
    <div class="faucet-content">
      <div class="container mb-5 column py-3 p-3 d-flex">
        <h1>{{ $t('views.history.trade_history') }}</h1>
        <div class="py-3">
          <div v-if="showHistoryTable"><faucet-table :items="history"></faucet-table></div>
          <div v-else>
            <h5>
              You haven't made any trades yet
            </h5>
            <small>Head over to the <router-link to="/validators">validators page</router-link> to get started</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue'
  import { Component } from 'vue-property-decorator'
  import FaucetTable from '../components/FaucetTable'
  import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

  import { formatToCrypto } from '@/utils'
  import { isIP } from 'net';

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
       "showLoadingSpinner"
     ])
    },
    methods: {
      ...DPOSStore.mapMutations([
        "setShowLoadingSpinner",
        "setLatesBlockNumber",
        "setCachedEvents"
      ])
    }
  })
  export default class History extends Vue {

    // "ERC20Received" = Deposit?
    // "TokenWithdrawn" = Withdraw?

    history = null

    async mounted() {
      // Check if there are any cached events
      if(this.latestBlockNumber && this.cachedEvents.length > 0) {
        // Query from latest block in cache
        await this.updateCachedEvents()
      } else {
        // Query the latest 10k blocks
        await this.queryEvents()
      }
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
      let events = await this.GatewayInstance.getPastEvents(
        "allEvents",
        {
          fromBlock: blockNumber-10000,
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

  }
  
  </script>

<style lang="scss" scoped>
  .dropdown-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
