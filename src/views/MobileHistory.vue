<template>
  <div class="py-4">
    <b-card title="Ethereum events" id="history-items-container" class="mb-3">
      <div v-if="state.ethereum.history.length">
        <history-event
          v-for="item in state.ethereum.history"
          :key="item.transactionHash"
          :event="item"
        ></history-event>
        <div v-for="item in state.ethereum.history" :key="item.transactionHash">gggggggg</div>
      </div>
      <div v-else>
        <p>No activity detected</p>
        <small>
          Or head over to the
          <router-link to="/validators">validators page</router-link>to get started
        </small>
      </div>
    </b-card>
    {{state.ethereum.history}}
    <b-card title="DappChain events" id="history-items-container" class="mb-3">
      <div v-if="showDappChainHistoryTable">
        <b-card v-for="(item, idx) in dappChainEvents" :key="'item' + idx" no-body class="mb-1">
          <b-card-header
            @click="toggleAccordion(idx)"
            header-tag="header"
            class="d-flex justify-content-between p-2"
            role="tab"
          >
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
        <p>No activity detected.</p>
        <small>
          Or head over to the
          <router-link to="/validators">validators page</router-link>to get started
        </small>
      </div>
    </b-card>
  </div>
</template>


<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import HistoryEvent from "../components/HistoryEvent.vue"

import { formatToCrypto } from "@/utils"
import { DashboardState } from "../types"
import { gatewayModule } from "../store/gateway";

@Component({
  components: {
    HistoryEvent,
  },
})
export default class History extends Vue {

  // "ERC20Received" = Deposit?
  // "TokenWithdrawn" = Withdraw?
  blockOffset = 10000
  history: any[] = []

  pollInterval: number | null = null
  pollingBlockNumber = 0

  get state(): DashboardState {
    return this.$store.state
  }


  get plasmaHistory() {
    return []
  }

  get ethererumBlockNumber() { return 0 }

  fetchDappChainEvents() { return 0 }
  setLatesBlockNumber() { return 0 }
  setCachedEvents() { return 0 }

  async mounted() {
    // await this.refresh()
    // this.pollLatestBlockNumber()
    gatewayModule.refreshEthereumHistory()
  }

  async updateCachedEvents() {
    return

    // // Filter based on user's address (does not seem to work)
    // // let filter = { from: this.currentMetamaskAddress }

    // // Get latest mined block from Ethereum
    // const blockNumber = await this.web3.eth.getBlockNumber()

    // // Fetch latest events
    // const events = await this.GatewayInstance.getPastEvents(
    //   "allEvents",
    //   {
    //     fromBlock: this.latestBlockNumber,
    //     toBlock: blockNumber,
    //   },
    // )

    // // Filter based on event type and user address
    // const results = events.filter((event) => {
    //   return event.returnValues.from === this.currentMetamaskAddress ||
    //     event.returnValues.owner === this.currentMetamaskAddress
    // }).map((event) => {
    //   const type = event.event === "ERC20Received" ? "Deposit" : event.event === "TokenWithdrawn" ? "Withdraw" : ""
    //   const amount = event.returnValues.amount || event.returnValues.value || 0
    //   return {
    //     "Block #": event.blockNumber,
    //     "Event": type,
    //     "Amount": formatToCrypto(amount),
    //     "Tx Hash": event.transactionHash,
    //   }
    // })

    // // Combine cached events with new events
    // const mergedEvents = this.cachedEvents.concat(results)

    // // // Store results
    // // this.setLatesBlockNumber(blockNumber)
    // // this.setCachedEvents(mergedEvents)

    // // // Display trades in the UI
    // // this.history = mergedEvents

    // // this.setShowLoadingSpinner(false)

  }

  async queryEvents() {
    return

    // this.setShowLoadingSpinner(true)

    // // Filter based on user's address (does not seem to work)
    // // let filter = { from: this.currentMetamaskAddress }
    // const blockNumber = await this.web3.eth.getBlockNumber()

    // // Fetch latest events

    // console.log("Fetching events with offset: ", this.blockOffset)

    // const events = await this.GatewayInstance.getPastEvents(
    //   "allEvents",
    //   {
    //     fromBlock: blockNumber - this.blockOffset,
    //     toBlock: blockNumber,
    //   },
    // )

    // // Filter based on event type and user address
    // const results = events.filter((event) => {
    //   return event.returnValues.from === this.currentMetamaskAddress ||
    //     event.returnValues.owner === this.currentMetamaskAddress
    // }).map((event) => {
    //   const type = event.event === "ERC20Received" ? "Deposit" : event.event === "TokenWithdrawn" ? "Withdraw" : ""
    //   const amount = event.returnValues.amount || event.returnValues.value || 0
    //   return {
    //     "Block #": event.blockNumber,
    //     "Event": type,
    //     "Amount": formatToCrypto(amount),
    //     "Tx Hash": event.transactionHash,
    //   }
    // })

    // // Store results
    // this.setLatesBlockNumber(blockNumber)
    // this.setCachedEvents(results)

    // // Display trades in the UI
    // this.history = results

    // this.setShowLoadingSpinner(false)

  }

  toggleAccordion(idx) {
    this.$root.$emit("bv::toggle::collapse", "history-item" + idx)
  }

  get showHistoryTable() {
    return this.history && this.history.length > 0
  }

  get showDappChainHistoryTable() {
    return false
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
</style>