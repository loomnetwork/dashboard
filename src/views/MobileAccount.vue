<template>
  <div id="mobile-account">
    <account-info />
    <b-card :title="$t('views.my_account.balance')" id="balances" class="mb-4" no-body>
      <b-card-header class="custom-card-header d-flex justify-content-between">
        <h4>{{ $t('views.my_account.balance') }}</h4>
        <a v-if="!showRefreshSpinner" @click="refresh">
          <fa :icon="['fas', 'sync']" class="refresh-icon" />
        </a>
        <b-spinner v-else type="border" small />
      </b-card-header>
      <b-card-body style="padding-top: 0;">
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
          <h6>{{ state.ethereum.genericNetworkName }}</h6>
            <h5 class="highlight" data-cy="ethereum-loom-balance">
              {{state.ethereum.coins.LOOM.balance | tokenAmount}} LOOM
              <b-spinner v-show="state.ethereum.coins.LOOM.loading" variant="primary" label="Spinning" small/>
            </h5>
          <h6>{{ $t('views.my_account.plasmachain') }}</h6>
          <div>
            <h5 class="highlight" data-cy="plasma-loom-balance">
              {{state.plasma.coins.LOOM.balance | tokenAmount}} LOOM
              <b-spinner v-show="state.plasma.coins.LOOM.loading" variant="primary" label="Spinning" small/>
            </h5>
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
        <h4 class="card-title" style="margin: 0;">{{ $t('views.mobile_account.validator_delegations') }}</h4>
      </b-card-body>
      <delegations :delegations="delegations" show-validator />
    </b-card>

    <!-- <pre>
      {{state.dpos.unclaimedTokens}}
    </pre> -->

    <div class="button-container mb-4">
      <b-button @click="$router.push({ path: '/validators' })">{{ $t('views.validator_detail.stake_tokens') }}</b-button>
    </div>

    <b-card :title="$t('views.mobile_account.other_delegations')" v-if="validator">
      <OtherDelegations :validator="validator" />
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import LoomIcon from "@/components/LoomIcon.vue"

import debug from "debug"
import Rewards from "@/dpos/components/Rewards.vue"
import AccountInfo from "@/components/Account.vue"
import { DashboardState } from "../types"
import { ethereumModule } from "../store/ethereum"
import { plasmaModule } from "../store/plasma"
import ElectionTimer from "@/dpos/components/ElectionTimer.vue"
import Delegations from "@/dpos/components/Delegations.vue"
import { Subscription, timer } from "rxjs"
import OtherDelegations from "@/dpos/components/OtherDelegations.vue"

const log = debug("mobileaccount")

@Component({
  components: {
    AccountInfo,
    LoomIcon,
    Rewards,
    ElectionTimer,
    Delegations,
    OtherDelegations,
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

  get validator() {
    const myValidator = this.state.dpos.validators.find((validator) => {
      return validator.addr === this.state.plasma.address
    })
    return myValidator ? myValidator : false
  }

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

#balances {
  h5.highlight {
    height:2rem; 
    line-height:2rem
  }
  .spinner-border {
    display: inline-block;
    margin-left: 0.8rem;
    margin-bottom: 0.4rem;
    vertical-align: middle;
  }
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