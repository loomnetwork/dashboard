<template>
  <b-card class="mb-1">
    <b-card-title>{{ $t('components.account.account') }}</b-card-title>
    <div class="account ethereum">
      <label>{{ foreignNetworkName }}</label>
      <address @click="copyEthereum">
        <span class="highlight">{{ethAccount}}</span>
        <fa icon="paste"/>
      </address>
      <a a class="explorer" :href="etherScanUrl" target="_blank">
        {{ foreignNetworkName === "Ethereum" ? $t('components.account.show_etherscan') : $t('components.account.show_bscscan') }}
        <fa icon="external-link-alt"/>
      </a>
    </div>
    <div class="account ethereum">
      <label>Loom</label>
      <address @click="copyPlasma">
        <span class="highlight">{{plasmaAccount | loomAddress}}</span>
        <fa icon="paste"/>
      </address>
      <a class="explorer" :href="loomScanUrl" target="_blank">
        {{ $t('components.account.show_block_explorer') }}
        <fa icon="external-link-alt"/>
      </a>
    </div>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { feedbackModule } from "@/feedback/store"
import { formatToLoomAddress } from "@/utils"

@Component
export default class Account extends Vue {
  etherScanUrl = `${this.state.ethereum.blockExplorer}/address/${this.ethAccount}`
  loomScanUrl = `${this.state.plasma.blockExplorer}/address/${this.plasmaAccount}/transactions`

  get state(): DashboardState {
    return this.$store.state
  }

  get foreignNetworkName() {
    return this.state.ethereum.genericNetworkName
  }

  get ethAccount() {
    return this.state.ethereum.address
  }

  get plasmaAccount() {
    return this.state.plasma.address
  }

  copyEthereum() {
    this.$copyText(this.ethAccount).then(() =>
      feedbackModule.showSuccess(
        this.$t("feedback_msg.success.eth_addr_copied", { network: this.foreignNetworkName }).toString(),
      ),
      console.error,
    )
  }

  copyPlasma() {
    this.$copyText(formatToLoomAddress(this.plasmaAccount)).then(() =>
      feedbackModule.showSuccess(this.$t("feedback_msg.success.plasma_addr_copied").toString()),
      console.error,
    )
  }

}
</script>
<style lang="scss" scoped>
.card {
  border: none;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
}
.account {
  display: flex;
  align-items: baseline;
  flex-direction: column;
  margin-bottom: 8px;
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
    text-align: right;
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
</style>
