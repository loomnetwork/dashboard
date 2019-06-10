<template>
  <div id="mobile-account">
    <b-card title="Balance" class="mb-4" no-body>
      <b-card-header class="custom-card-header d-flex justify-content-between">
        <h4>Balance</h4>
        <a v-if="!showRefreshSpinner" @click="refresh">
          <fa :icon="['fas', 'sync']" class="refresh-icon"/>
        </a>
        <b-spinner v-else type="border" small/>
      </b-card-header>
      <b-card-body>
        <b-card
          v-if="currentAllowance && !gatewayBusy"
          bg-variant="warning"
          text-variant="white"
          header="Warning"
          class="text-center mb-3"
        >
          <b-card-text>
            <p
              class="warning-copy mb-2"
            >{{currentAllowance}} LOOM awaiting transfer to plasmachain account.</p>
            <b-btn size="sm" variant="primary">Resume Deposit</b-btn>
          </b-card-text>
        </b-card>

        <div class="p3">
          <h6>{{ $t('views.my_account.mainnet') }}</h6>
          <div>
            <h5 class="highlight">
              {{state.ethereum.coins.loom.balance | tokenAmount}} LOOM
              <loom-icon
                v-if="!state.ethereum.coins.loom.loading"
                :color="'#f0ad4e'"
                width="20px"
                height="20px"
              />
            </h5>
          </div>
          <div v-if="state.ethereum.coins.loom.loading">
            <b-spinner variant="primary" label="Spinning"/>
          </div>
          <h6>{{ $t('views.my_account.plasmachain') }}</h6>
          <div>
            <h5 class="highlight">
              {{state.plasma.coins.loom.balance | tokenAmount}} LOOM
              <loom-icon
                v-if="!state.plasma.coins.loom.loading"
                :color="'#f0ad4e'"
                width="20px"
                height="20px"
              />
            </h5>
          </div>
          <div v-if="state.plasma.coins.loom.loading">
            <b-spinner variant="primary" label="Spinning"/>
          </div>
          <!-- unclaimed 
          <div v-if="unclaimWithdrawTokensETH > 0 && !gatewayBusy">
            <p>{{$t('views.my_account.tokens_pending_withdraw',{pendingWithdrawAmount:unclaimWithdrawTokensETH} )}}</p>
            <br>
            <div class="center-children" id="complete-withdrawal-container">
              <b-btn
                variant="outline-primary"
                class="mr-2"
                @click="reclaimWithdrawHandler"
              >{{$t('views.my_account.complete_withdraw')}}</b-btn>
              <b-spinner
                v-if="isWithdrawalInprogress || hasJustWithdrawn()"
                variant="primary"
                label="Spinning"
                small
              />
              <b-tooltip
                v-if="isWithdrawalInprogress || hasJustWithdrawn()"
                target="complete-withdrawal-container"
                placement="bottom"
                title="Your transaction is processing, check back in a few mintues."
              ></b-tooltip>
            </div>
          </div>
          -->
          <b-modal
            id="wait-tx"
            title="Done"
            hide-footer
            centered
            no-close-on-backdrop
          >{{ $t('views.my_account.wait_tx') }}</b-modal>
          <!--
          <b-modal
            id="unclaimed-tokens"
            title="Unclaimed Tokens"
            hide-footer
            centered
            no-close-on-backdrop
          >
            <p>{{$t('views.my_account.tokens_pending_deposit',{pendingDepositAmount:unclaimedTokens} )}}</p>
            <b-btn
              variant="outline-primary"
              @click="reclaimDepositHandler"
            >{{$t('views.my_account.reclaim_deposit')}}</b-btn>
          </b-modal>
          -->
        </div>
      </b-card-body>

      <!--
      <b-card-footer class="custom-card-footer">
        <DepositForm/>
        <a
          v-if="pendingTx"
          style="display: flex;align-items: center;"
          :href="`https://etherscan.io/tx/${pendingTx.hash}`"
          target="_blank"
        >
          <b-spinner variant="primary" style="margin-right:16px;"></b-spinner>
          <span>pending: {{pendingTx.type}}</span>
        </a>
        <footer
          v-if="unclaimWithdrawTokensETH == 0 && unclaimedTokens.isZero() && !pendingTx"
          class="d-flex justify-content-between"
        >
          <b-button-group class="gateway" style="display: flex;">
            <b-btn
              variant="outline-primary"
              @click="setShowDepositForm(true)"
            >{{ $t("components.faucet_header.deposit")}}</b-btn>
            <TransferStepper
              v-if="userBalance.loomBalance > 0 && oracleEnabled"
              @withdrawalDone="afterWithdrawalDone"
              @withdrawalFailed="afterWithdrawalFailed"
              :balance="userBalance.loomBalance"
              :transferAction="executeWithdrawal"
              :resolveTxSuccess="resolveWithdraw"
              buttonLabel="Withdraw"
              executionTitle="Execute transfer"
            >
              <template #pendingMessage>
                <p>Transfering funds from plasma chain to your ethereum account...</p>
              </template>
              <template #failueMessage>Withdrawal failed... retry?</template>
              <template #confirmingMessage>Waiting for ethereum confirmation</template>
            </TransferStepper>
          </b-button-group>
        </footer>
      </b-card-footer>
      -->
    </b-card>

    <b-card title="Election Cycle" class="mb-4">
      <h6>Time left</h6>
      <ElectionTimer/>
    </b-card>

    <rewards></rewards>

    <b-card title="Delegations" id="delegations-container">
      <b-card
        v-for="(delegation, idx) in state.dpos.delegations"
        :key="'delegations' + idx"
        no-body
        class="mb-1"
      >
        <b-card-header
          @click="toggleAccordion(idx)"
          header-tag="header"
          class="d-flex justify-content-between p-2"
          role="tab"
        >
          <span>{{delegation.validator.name}}</span>
          <strong>{{delegation.amount | tokenAmount}}</strong>
        </b-card-header>
        <b-collapse :id="'accordion' + idx" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <ul>
              <li
                v-if="!delegation.updateAmount.isZero()"
              >Update amount: {{delegation.updateAmount}}</li>
              <li>Unlock time: {{delegation.lockTime}}</li>
              <li>State: {{delegation.state}}</li>
            </ul>
          </b-card-body>
        </b-collapse>
      </b-card>
    </b-card>

    <div class="button-container">
      <b-button @click="$router.push({ path: '/validators' })">Stake tokens</b-button>
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
import TransferStepper from "../components/TransferStepper.vue"
import DepositForm from "@/components/gateway/DepositForm.vue"
import Rewards from "@/dpos/components/Rewards.vue"
import { DPOSTypedStore } from "../store/dpos-old"
import { CommonTypedStore } from "../store/common"
import { DashboardState } from "../types"
import { ethereumModule } from "../store/ethereum"
import { plasmaModule } from "../store/plasma"
import { dposModule } from "@/dpos/store"
import ElectionTimer from "@/dpos/components/ElectionTimer.vue"

const log = debug("mobileaccount")

const ELECTION_CYCLE_MILLIS = 600000

@Component({
  components: {
    LoomIcon,
    TransferStepper,
    DepositForm,
    Rewards,
    ElectionTimer,
  },
})
export default class MobileAccount extends Vue {

  get state(): DashboardState {
    return this.$store.state
  }

  currentAllowance = 0

  // gateway related
  // unclaimed tokens
  unclaimedTokens = new BN(0)
  unclaimWithdrawTokens = 0
  unclaimWithdrawTokensETH = 0
  unclaimSignature = ""
  oracleEnabled = true
  receipt: any = null
  isWithdrawalInprogress = false
  withdrawLimit = 0

  showRefreshSpinner = false

  // methods
  setGatewayBusy = DPOSTypedStore.setGatewayBusy
  setShowLoadingSpinner = CommonTypedStore.setShowLoadingSpinner
  setShowDepositForm = DPOSTypedStore.setShowDepositForm
  setErrorMsg = CommonTypedStore.setErrorMsg

  get web3() { return DPOSTypedStore.state.web3 }
  get dposUser() { return DPOSTypedStore.state.dposUser }
  get validators() { return DPOSTypedStore.state.validators }
  get gatewayBusy() { return DPOSTypedStore.state.gatewayBusy }
  get rewardsResults() { return DPOSTypedStore.state.rewardsResults }
  get delegations() { return DPOSTypedStore.state.delegations }
  get states() { return DPOSTypedStore.state.states }
  get pendingTx() { return DPOSTypedStore.state.pendingTx }

  get formatedDelegations() {
    const candidates = this.validators
    console.log(this.delegations)
    return this.delegations
      .filter((d) => d.index > 0)
      .map((delegation) => {
        const candidate = candidates.find((c) => c.address === delegation.validator.local.toString())
        return {
          "Name": candidate.name,
          "Amount": `${formatToCrypto(delegation.amount)}`,
          "Update Amount": `${formatToCrypto(delegation.updateAmount)}`,
          "Locktime": `${new Date(delegation.lockTime * 1000)}`,
          "State": `${this.states[delegation.state]}`,
          "_cellVariants": { Status: "active" },
        }
      })
  }

  toggleAccordion(idx) {
    this.$root.$emit("bv::toggle::collapse", "accordion" + idx)
  }

  async completeDeposit() {
    const dposUser = await this.dposUser!
    this.setGatewayBusy(true)
    this.setShowLoadingSpinner(true)
    const tokens = new BN(this.currentAllowance)
    const weiAmount = new BN(this.web3.utils.toWei(tokens, "ether"), 10)
    try {
      await dposUser.ethereumGateway.functions.depositERC20(
        weiAmount.toString(),
        dposUser.ethereumLoom.address,
      )
      this.currentAllowance = 0
    } catch (error) {
      console.error(error)
    }
    this.$emit("refreshBalances")
    this.setGatewayBusy(false)
    this.setShowLoadingSpinner(false)
  }

  refresh() {
    ethereumModule.refreshBalance("loom")
    plasmaModule.refreshBalance("loom")
  }

  get rewardsValue() {
    return this.rewardsResults ? (this.rewardsResults.toString() + " LOOM") : "0.00"
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
</style>

<style lang="scss">
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
