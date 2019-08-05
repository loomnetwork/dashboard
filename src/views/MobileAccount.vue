<template>
  <div id="mobile-account">
    <account-info />
    <b-card :title="$t('views.my_account.balance')" class="mb-4" no-body>
      <b-card-header class="custom-card-header d-flex justify-content-between">
        <h4>{{ $t('views.my_account.balance') }}</h4>
        <a v-if="!showRefreshSpinner" @click="refresh">
          <fa :icon="['fas', 'sync']" class="refresh-icon" />
        </a>
        <b-spinner v-else type="border" small />
      </b-card-header>
      <b-card-body>
        <b-card
          v-if="currentAllowance && !gatewayBusy"
          bg-variant="warning"
          text-variant="white"
          :header="$t('views.mobile_account.warning')"
          class="text-center mb-3"
        >
          <b-card-text>
            <p
              class="warning-copy mb-2"
            >{{currentAllowance}} {{ $t('views.mobile_account.loom_awaiting_transfer') }}</p>
            <b-btn size="sm" variant="primary">{{ $t('views.mobile_account.resume_deposit') }}</b-btn>
          </b-card-text>
        </b-card>

        <div class="p3">
          <h6>{{ $t('views.my_account.mainnet') }}</h6>
          <div>
            <h5 class="highlight">
              {{state.ethereum.coins.LOOM.balance | tokenAmount}} LOOM
              <loom-icon
                v-if="!state.ethereum.coins.LOOM.loading"
                :color="'#f0ad4e'"
                width="20px"
                height="20px"
              />
            </h5>
          </div>
          <div v-if="state.ethereum.coins.LOOM.loading">
            <b-spinner variant="primary" label="Spinning" />
          </div>
          <h6>{{ $t('views.my_account.plasmachain') }}</h6>
          <div>
            <h5 class="highlight">
              {{state.plasma.coins.LOOM.balance | tokenAmount}} LOOM
              <loom-icon
                v-if="!state.plasma.coins.LOOM.loading"
                :color="'#f0ad4e'"
                width="20px"
                height="20px"
              />
            </h5>
          </div>
          <div v-if="state.plasma.coins.LOOM.loading">
            <b-spinner variant="primary" label="Spinning" />
          </div>
          <b-link href="#" class="card-link">
            <router-link to="/wallet">{{ $t('components.faucet_sidebar.deposit_withdraw') }}</router-link>
          </b-link>
          <b-modal
            id="wait-tx"
            :title="$t('button.done')"
            hide-footer
            centered
            no-close-on-backdrop
          >{{ $t('views.my_account.wait_tx') }}</b-modal>
        </div>
      </b-card-body>
    </b-card>

    <b-card :title="$t('views.mobile_account.election_cycle')" class="mb-4">
      <h6>{{ $t('views.mobile_account.time_left') }}</h6>
      <election-timer />
    </b-card>

    <rewards></rewards>

    <b-card id="delegations-container" no-body>
      <b-card-body>
        <h4 class="card-title" style="margin: 0;">{{ $t('views.mobile_account.delegations') }}</h4>
      </b-card-body>
      <delegations :delegations="delegations" show-validator />
    </b-card>

    <pre>
      {{state.dpos.unclaimedTokens}}
    </pre>

    <div class="button-container">
      <b-button @click="$router.push({ path: '/validators' })">{{ $t('views.validator_detail.stake_tokens') }}</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import LoomIcon from "@/components/LoomIcon.vue"

import Web3 from "web3"
import BN from "bn.js"
import debug from "debug"
import { formatToCrypto, sleep } from "@/utils.ts"
import Rewards from "@/dpos/components/Rewards.vue"
import AccountInfo from "@/components/Account.vue"
import { DashboardState } from "../types"
import { ethereumModule } from "../store/ethereum"
import { plasmaModule } from "../store/plasma"
import { dposModule } from "@/dpos/store"
import ElectionTimer from "@/dpos/components/ElectionTimer.vue"
import Delegations from "@/dpos/components/Delegations.vue"
import { Subscription, timer } from "rxjs"

const log = debug("mobileaccount")

const ELECTION_CYCLE_MILLIS = 600000

@Component({
  components: {
    AccountInfo,
    LoomIcon,
    Rewards,
    ElectionTimer,
    Delegations,
  },
})
export default class MobileAccount extends Vue {

  get state(): DashboardState {
    return this.$store.state
  }

  currentAllowance = 0
  withdrawLimit = 0

  showRefreshSpinner = false

  refreshTimer: Subscription | null = null

  get delegations() { return this.state.dpos.delegations }

  toggleAccordion(idx) {
    this.$root.$emit("bv::toggle::collapse", "accordion" + idx)
  }

  refresh() {
    ethereumModule.refreshBalance("LOOM")
    plasmaModule.refreshBalance("LOOM")
  }

  mounted() {
    this.refreshTimer = timer(0, 15000).subscribe(() => {
      this.refresh()
    })
  }

  beforeDestroy() {
    if (this.refreshTimer != null) {
      this.refreshTimer.unsubscribe()
    }
  }
}
</script>

<style lang="scss">
#mobile-account {
  padding-top: 1.5rem;
  padding-bottom: 5.5rem;
}

h3 {
  color: #02020202;
}

.warning-copy {
  color: #ffffff;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  padding: 12px;
  left: 0px;
  box-shadow: rgba(219, 219, 219, 0.56) 0px -3px 8px 0px;
  button {
    display: block;
    background-color: #4e4fd2;
  }
}

.custom-card-header {
  padding-bottom: 0px;
  border: none;
}

.custom-card-header,
.custom-card-footer {
  background-color: #ffffff;
}

.gateway {
  width: 100%;
}
.gateway.btn-group > div {
  flex: 1;
  .btn {
    display: block;
    width: 100%;
  }
}
.gateway.btn-group div:not(:last-child) .btn {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.gateway.btn-group div:last-child .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
}
#delegations-container {
  .card-header {
    background-color: #fff;
  }
}

div > .card {
  border: none;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
}
</style>