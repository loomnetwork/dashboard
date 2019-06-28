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
        <div class="events">
          <article v-for="(event, id) in plasmaHistory" :key="id" class="event">
            <h5 class="type">{{ $t( "events." + event.type) }}</h5>
            <ul>
              <li class="block">Block # {{event.blockNumber}}</li>
              <li class="amount">{{event.amount | tokenAmount}}</li>
            </ul>
            <!--
        <a class="transaction-hash" href target="_blank">{{event.transactionHash}}</a>
            -->
          </article>
        </div>

        <div v-if="state.plasma.history.length === 0">
          <p>No activity detected.</p>
          <small>
            Or head over to the
            <router-link to="/validators">validators page</router-link>to get started
          </small>
        </div>
      </section>
      <section v-else-if="visible === 'ethereum'">
        <div class="events">
          <history-event v-for="(item,i) in ethereumHistory" :key="i" :event="item"></history-event>
        </div>
        <!--
        <b-pagination
          v-if="state.ethereum.history.length"
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          aria-controls="my-table"
        ></b-pagination>-->
        <div v-if="state.ethereum.history.length == 0">
          <p>
            No activity detected.
            <a>Deposit funds to the PlasmaChain</a>
          </p>
        </div>
      </section>
    </div>
  </main>
</template>


<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import HistoryEvent from "../components/HistoryEvent.vue"

import { formatToCrypto } from "@/utils"
import { DashboardState } from "../types"
import { gatewayModule } from "../store/gateway"
import { plasmaModule } from "../store/plasma"

@Component({
  components: {
    HistoryEvent,
  },
})
export default class History extends Vue {

  visible = "plasma"

  get state(): DashboardState {
    return this.$store.state
  }

  get plasmaHistory() {
    const plasmaHistory = this.state.plasma.history.filter(history => history.amount > 0)
    return plasmaHistory
  }

  get ethereumHistory() {
    const ethereumHistory = this.state.ethereum.history.filter(history => history.amount > 0)
    return ethereumHistory
  }

  async mounted() {
    gatewayModule.refreshEthereumHistory()
    plasmaModule.refreshHistory()
  }

}
</script>

<style lang="scss" scoped>
.events {
  height: calc(100vh - 200px);
  overflow: scroll;
  padding: 5px;
  box-shadow: inset 0px 0px 5px #80808094;
  max-width: 620px;
  border: 1px solid #ededed;

  .event {
    position: relative;
    display: flex;
    max-width: 600px;
    border-left: 5px solid #00bcd4;
    box-shadow: rgba(219, 219, 219, 0.56) -1px 1px 3px 0px;
    margin: 0 0 5px 0;
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
</style>