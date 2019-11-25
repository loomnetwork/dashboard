<template>
  <b-card>
      <b-card-title>
        Airdrop
      </b-card-title>
      <hr />

      <b-card-body v-if="usersAirdrops.length !== 0">
       usersAirdrops.. {{usersAirdrops}}
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

@Component({})
export default class Airdrop extends Vue {
  checkAirdrop = airdropModule.checkAirdrop

  get state(): DashboardState {
    return this.$store.state
  }

  get usersAirdrops() {
    return this.state.airdrop.usersAirdrops
  }

  async mounted() {
    await this.checkAirdrop()
  }
}
</script>