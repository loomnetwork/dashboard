<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { dashboardStore } from "@/store"
import { ethereumModule } from "@/store/ethereum"
import { plasmaModule } from "@/store/plasma"
import { DashboardState, DashboardConfig } from "@/types"

@Component
export default class ChainSelector extends Vue {
  get env(): DashboardConfig {
    const state = this.$store.state as DashboardState
    return state.envs.find((env) => env.name === state.env)!
  }

  set env(config: DashboardConfig) {
    console.log("config", config)
    localStorage.setItem("selectedConfig", config.name)
    window.location.reload()
  }

  get envs() {
    console.log("get envs", this.$store.state.envs)
    return (this.$store.state as DashboardState).envs
  }
}
</script>
<template>
  <div id="chain-selector" v-if="envs.length > 1">
    <b-form-select v-model="env" size="sm" class="mt-3">
      <option v-for="env in envs" :value="env" :key="env.name">
        {{ env.name }}
      </option>
    </b-form-select>
  </div>
</template>
<style lang="scss">
#chain-selector {
  .dropdown-menu {
    transform: translate3d(-224px, 31px, 0px) !important;
  }
}
</style>
