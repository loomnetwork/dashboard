<template>
  <main class="container py-4">
    <header>
      <h1>History</h1>
      <b-button class="help" variant="outline-info" pill size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <div style="max-width: 620px;margin:0 auto">
      <b-button-group style="display: flex" class="py-4">
        <b-button
          variant="outline-primary"
          @click="visible = 'plasma'"
          :class="{active:visible === 'plasma'}"
        >PlasmaChain</b-button>
        <b-button
          variant="outline-primary"
          @click="visible = 'ethereum'"
          :class="{active:visible === 'ethereum'}"
        >Ethereum</b-button>
      </b-button-group>

      <section v-if="visible === 'plasma'">
        <div v-if="plasmaHistory && plasmaHistory.length === 0">
          <p>No activity detected.</p>
          <small>
            Or head over to the
            <router-link to="/validators">validators page</router-link>to get started
          </small>
        </div>        
        <div v-else class="events list-wrapper">
          <loading-spinner v-if="loadingTally === 2" :showBackdrop="false"></loading-spinner>
          <virtual-list :size="110" :remain="5">
            <article v-for="(event, id) in plasmaHistory" :key="id" class="event">
              <h5 class="type">{{ $t( "events." + event.type) }}</h5>
              <ul>
                <li class="block">Block # {{event.blockNumber}}</li>
                <li class="amount">{{event.amount | tokenAmount}} {{event.token}}</li>
              </ul>
              <!--
          <a class="transaction-hash" href target="_blank">{{event.transactionHash}}</a>
              -->
            </article>            
          </virtual-list>          
        </div>
      </section>
      <section v-else-if="visible === 'ethereum'" class="list-wrapper">
        <div v-if="ethereumHistory && ethereumHistory.length === 0">
          <p>
            No activity detected.
            <a>Deposit funds to the PlasmaChain</a>
          </p>
        </div>        
        <div v-else class="events list-wrapper">
          <loading-spinner v-if="loadingTally >= 1" :showBackdrop="false"></loading-spinner>
          <virtual-list :size="110" :remain="5">
            <history-event v-for="(item,i) in ethereumHistory" :key="i" :event="item"></history-event>
          </virtual-list>
        </div>
      </section>
    </div>
  </main>
</template>


<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import HistoryEvent from "../components/HistoryEvent.vue"
import LoadingSpinner from "../components/LoadingSpinner.vue"
import VirtualList from "vue-virtual-scroll-list"
import Web3 from "web3"

import { formatToCrypto } from "@/utils"
import { DashboardState } from "../types"
import { gatewayModule } from "../store/gateway"
import { plasmaModule } from "../store/plasma"
import { ethereumModule } from "../store/ethereum"

@Component({
  components: {
    HistoryEvent,
    VirtualList,
    LoadingSpinner,
  },
})
export default class History extends Vue {

  visible = ""
  loadingTally = 2
  plasmaHistory: any[] | null = null
  ethereumHistory: any[] | null = null

  setBlockNumber = ethereumModule.setBlockNumber

  get state(): DashboardState {
    return this.$store.state
  }

  async mounted() {
    this.visible = "plasma"
    if (!this.state.ethereum.blockNumber) await this.refreshBlockNumber()
    await this.setPlasmaHistory()
    await this.setEthereumHistory()
  }

  fetchProps(idx) {
    return this.state.ethereum.history[idx]
  }

  async setPlasmaHistory() {
    await plasmaModule.refreshHistory()
    this.plasmaHistory = this.state.plasma.history.filter((history) => history.amount > 0)
    this.loadingTally--
  }

  async setEthereumHistory() {
    await gatewayModule.refreshEthereumHistory()
    this.ethereumHistory = this.state.ethereum.history.filter((history) => history.amount > 0)
    this.loadingTally--
  }

  async refreshBlockNumber() {
    const web3: Web3 = ethereumModule.web3!
    const blockNumber = await web3!.eth.getBlockNumber()
    this.setBlockNumber(blockNumber)
  }

}
</script>

<style lang="scss" scoped>
.events {

  .event {
    position: relative;
    display: flex;
    max-width: 600px;
    border-left: 5px solid #00bcd4;
    box-shadow: rgba(219, 219, 219, 0.56) -1px 1px 3px 0px;
    margin: 0 0 10px 0;
    height: 100px;
    background: white;

    .type {
      font-size: 1rem;
      padding: 10px;
      &.deposit {
        font-size: 1rem;
        padding: 10px;
      }
    }

    .amount {
      position: absolute;
      top: 40px;
      left: 10px;
    }

    &.deposit .type {
      color: #00bcd4;
    }
  }
  ul {
    list-style: none;
  }
  .block {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 12px;
  }
  .transaction-hash {
    font-size: 9px;
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-family: Monaco;
    max-width: 475px;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    @media (min-width: 529px) {
      & {
        font-size: 12px;
      }
    }
  }
  .confirmations {
    position: absolute;
    top: 40px;
    right: 10px;
    .spinner-border {
      height: 16px;
      width: 16px;
    }
  }
}
.list-wrapper {
  position: relative;
  min-height: 280px;
}
</style>