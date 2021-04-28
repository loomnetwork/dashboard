<template>
  <main class="container py-4">
    <header>
      <h1>{{ $t('views.my_account.history') }}</h1>
      <b-button class="help" variant="outline-info" pill size="sm" @click="showHelp =!showHelp">?</b-button>
    </header>
    <div style="max-width: 620px;margin:0 auto">
      <b-button-group style="display: flex" class="py-4">
        <b-button
          variant="outline-primary"
          @click="visible = 'plasma'"
          :class="{active: visible === 'plasma'}"
        >Basechain</b-button>
        <b-button
          variant="outline-primary"
          @click="visible = 'ethereum'"
          :class="{active: visible === 'ethereum'}"
        >{{ foreignNetworkName }}</b-button>
      </b-button-group>

      <section v-if="visible === 'plasma'">
        <div v-if="plasmaHistory && plasmaHistory.length === 0">
          <p>{{ $t('views.history.no_activity') }}</p>
          <small>
            <i18n path="views.history.or_head_to_validators_page">
              <router-link to="/validators" place="page">{{ $t('views.history.validators_page') }}</router-link>
            </i18n>
          </small>
        </div>
        <div v-else class="events list-wrapper">
          <loading-spinner v-if="plasmaHistory === null" :showBackdrop="false"></loading-spinner>
          <virtual-list :size="110" :remain="5">
            <article v-for="(event, id) in plasmaHistory" :key="id" class="event">
              <h5 class="type">{{ $t( "events." + event.type) }}</h5>
              <ul>
                <li class="block">{{ $t('components.history_event.block_no') }} {{event.blockNumber}}</li>
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
          <p v-if="foreignNetIsBSC">
            {{ $t('views.history.no_activity_in_n', { blocks: 5000}) }}&nbsp;
            <a :href="state.ethereum.blockExplorer + '/address/' + state.ethereum.address" target="_blank">{{ 
              $t('views.history.check_block_explorer', {explorer: "BSCScan"}) 
            }}&nbsp;<fa icon="external-link-alt"/></a> 
          <p v-else>
            {{ $t('views.history.no_activity') }}
            <a>{{ $t('views.history.funds_to_plasma') }}</a>
          </p>
        </div>
        <div v-else class="events list-wrapper">
          <loading-spinner v-if="ethereumHistory === null" :showBackdrop="false"></loading-spinner>
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

import { DashboardState } from "../types"
import { gatewayModule } from "../store/gateway"
import { plasmaModule } from "../store/plasma"

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

  get state(): DashboardState {
    return this.$store.state
  }

  get foreignNetworkName() {
    return this.state.ethereum.genericNetworkName
  }

  async mounted() {
    this.visible = "plasma"
    await this.setPlasmaHistory()
    await this.setEthereumHistory()
  }

  async setPlasmaHistory() {
    await plasmaModule.refreshHistory()
    this.plasmaHistory = this.state.plasma.history
  }

  async setEthereumHistory() {
    await gatewayModule.refreshEthereumHistory()
    this.ethereumHistory = this.state.ethereum.history
  }

  get foreignNetIsBSC() {
    return this.state.ethereum.networkName.startsWith("bsc-")
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