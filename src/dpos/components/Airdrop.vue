<template>
  <b-card class="mb-4">
      <b-card-header class="custom-card-header d-flex justify-content-between">
        <h4> {{$t('views.airdrop.airdrop')}} </h4>
        <a v-if="!showRefreshSpinner" @click="refreshAirdrop">
          <fa :icon="['fas', 'sync']" class="refresh-icon" />
        </a>
        <b-spinner v-else type="border" small />
      </b-card-header>

      <b-card-body v-if="usersAirdrops.length !== 0">
        <b-list-group-item v-for="usersAirdrop in usersAirdrops" :key="usersAirdrop.airdropID">
        <dl>
            <dt>{{$t('views.airdrop.airdrop_amount')}}:</dt>
            <dd>{{usersAirdrop.airdropAmount | tokenAmount(getTokensInfo(usersAirdrop.tokenAddress).decimals)}}</dd>
            <dt>{{$t('views.airdrop.token')}}:</dt>
            <dd>{{getTokensInfo(usersAirdrop.tokenAddress).name}}</dd>
            <dt>{{$t('views.airdrop.unlock_time')}}:</dt>
            <dd>{{usersAirdrop.timelock | date('seconds')}}</dd>
        </dl>
        <b-button
          block
          variant="outline-primary"
          type="button"
          @click="withdraw(usersAirdrop.airdropID)"
          :disabled="isOntimeLocked(usersAirdrop) || usersAirdrop.isWithdrew"
        >
        {{$t('views.airdrop.withdraw')}}
        </b-button>
        </b-list-group-item>
      </b-card-body>
      <b-card-body v-else>
        {{$t('views.airdrop.no_airdrop')}}.
      </b-card-body>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch, Prop } from "vue-property-decorator"
import { airdropModule } from "../../store/plasma/airdrop"
import { DashboardState } from "@/types"
import { AirdropDetail } from "@/store/plasma/types"
import { tokenService } from "../../services/TokenService"

@Component({})
export default class Airdrop extends Vue {
  fetchAirdrop = airdropModule.fetchAirdrop
  withdrawAirdrop = airdropModule.withdrawAirdrop
  isAirdropWithdrew = airdropModule.isAirdropWithdrew
  showRefreshSpinner = false

  get state(): DashboardState {
    return this.$store.state
  }

  isOntimeLocked(usersAirdrop: AirdropDetail) {
    return usersAirdrop.timelock - Date.now() / 1000 > 0
  }

  get usersAirdrops() {
    return this.state.airdrop.usersAirdrops.filter((airdrop) => !airdrop.isWithdrew)
  }

  getTokensInfo(tokenAddr: string) {
    return tokenService.tokenFromAddress(tokenAddr.toLowerCase(), "plasma")
  }

  async mounted() {
    await this.fetchAirdrop()
  }

  async withdraw(airdropID: number) {
    await this.withdrawAirdrop({airdropID})
    await this.fetchAirdrop()
  }

  async refreshAirdrop() {
    this.showRefreshSpinner = true
    await this.fetchAirdrop()
    this.showRefreshSpinner = false
  }

}
</script>
<style lang="scss">
</style>