<template>
  <b-card class="mb-4">
      <b-card-title>
        Airdrop
      </b-card-title>
      <hr />

      <b-card-body v-if="usersAirdrops.length !== 0">
        <b-list-group-item v-for="usersAirdrop in usersAirdrops" :key="usersAirdrop.airdropID">
        <dl>
            <dt>Airdrop Amount:</dt>
            <dd>{{usersAirdrop.airdropAmount | tokenAmount(getTokensInfo(usersAirdrop.tokenAddress).decimals)}}</dd>
            <dt>Token:</dt>
            <dd>{{getTokensInfo(usersAirdrop.tokenAddress).name}}</dd>
            <dt>Unlock time:</dt>
            <dd>{{usersAirdrop.timelock | date('seconds')}}</dd>
        </dl>
        <b-button
          block
          variant="outline-primary"
          type="button"
          @click="withdraw(usersAirdrop.airdropID)"
          :disabled="!isWithdrawable(usersAirdrop)"
        >withdraw</b-button>
        </b-list-group-item>
      </b-card-body>
      <b-card-body v-else>
        You have no airdrop.
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
  checkAirdrop = airdropModule.checkAirdrop
  withdrawAirdrop = airdropModule.withdrawAirdrop

  get state(): DashboardState {
    return this.$store.state
  }

  isWithdrawable(usersAirdrop: AirdropDetail) {
    return usersAirdrop.timelock - Date.now() / 1000 <= 0
  }

  get usersAirdrops() {
    return this.state.airdrop.usersAirdrops
  }

  getTokensInfo(tokenAddr: string) {
    return tokenService.tokenFromAddress(tokenAddr.toLowerCase(), "plasma")
  }

  async mounted() {
    await this.checkAirdrop()
  }

  async withdraw(airdropID: number) {
    await this.withdrawAirdrop({airdropID})
  }
}
</script>