<template>
  <b-container class="mb-4">
    <b-row class="mt-3 mb-2">
      <b-col>
        <h2>{{ tokenData.symbol }}</h2>
      </b-col>
      <b-col>
        <b-button-group class="chain-tabs">
          <b-button
            variant="outline-primary"
            :class="{active: chainTabs ==='ethereum'}"
            @click="toggleChains('ethereum')"
          >Ethereum</b-button>
          <b-button
            variant="outline-primary"
            :class="{active: chainTabs ==='binance'}"
            @click="toggleChains('binance')"
          >Binance</b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row class="mt-4">
      <b-col class="account">
        <label>Ethereum</label>
        <address @click="copyEthereum">
          <span v-if="!tokenData.ethereum" class="highlight">-</span>
          <span v-else class="highlight">{{ tokenData.ethereum }}</span>
          <fa icon="paste" />
        </address>
      </b-col>
      <b-col class="account">
        <label>Basechain</label>
        <address @click="copyPlasma">
          <span v-if="!tokenData.plasma" class="highlight">-</span>
          <span v-else class="highlight">{{ tokenData.plasma }}</span>
          <fa icon="paste" />
        </address>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { TokenData } from "../services/TokenService"
import { feedbackModule } from "../feedback/store"
import { DashboardState } from "@/types"

@Component
export default class MappedTokenAddress extends Vue {
  @Prop() tokenData!: TokenData

  chainTabs: "ethereum" | "binance" | "" = ""

  get state(): DashboardState {
    return this.$store.state
  }

  mounted() {
    this.chainTabs = "ethereum"
  }

  copyEthereum() {
    this.$copyText(this.tokenData.ethereum).then(() =>
      feedbackModule.showSuccess(
        this.$t("feedback_msg.success.eth_addr_copied", { network: this.state.ethereum.genericNetworkName }).toString(),
      ),
      console.error,
    )
  }

  copyPlasma() {
    this.$copyText(this.tokenData.plasma).then(() =>
      feedbackModule.showSuccess(this.$t("feedback_msg.success.plasma_addr_copied").toString()),
      console.error,
    )
  }

  toggleChains(value) {
    this.chainTabs = value
    this.$emit("toggleChain", this.chainTabs)
  }
}
</script>

<style lang="scss" scoped>
.account {
  display: flex;
  align-items: baseline;
  flex-direction: column;
  label {
    width: 82px;
    font-size: 0.825rem;
    font-weight: bold;
    margin: 0 8px 0 0;
  }
}
address {
  flex: 1;
  display: flex;
  align-items: baseline;
  max-width: 300px;
  margin-bottom: 0;
  align-items: center;
  background: #0000000d;
  border-radius: 11px;
  padding: 2px 10px;
  box-shadow: inset 0px 1px 4px #0000001d;
  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    flex: 1;
    text-align: left;
    margin: 0 8px 0;
    font-size: 0.825rem;
    min-width: 100px;
    max-width: 300px;
  }
  > svg {
    color: gray;
  }
}
a.explorer {
  font-size: 0.825rem;
  white-space: nowrap;
  padding-left: 16px;
}

@media only screen and (min-width: 780px) {
  .account {
    flex-direction: row;
  }
  address {
    max-width: 380px;
    span {
      min-width: 100px;
      max-width: 400px;
    }
    > svg {
      color: gray;
    }
  }
  a.explorer {
    flex: 1;
  }
}

.chain-tabs {
  
  float: right;
  padding-right: 3.75rem;
}
</style>
