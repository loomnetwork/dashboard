<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import { dashboardStore } from "@/store"
import { ethereumModule } from "@/store/ethereum"
import { plasmaModule } from "@/store/plasma"
import { DashboardState } from "@/types"

@Component
export default class ChainSelector extends Vue {
  get env() {
    return this.$store.state.env
  }

  set env(config) {
    console.log("config", config)
    dashboardStore.setEnv(config)
  }

  get envs() {
    console.log("get envs", this.$store.state.envs)
    return (this.$store.state as DashboardState).envs
  }
}

</script>
<template>
  <div id="chain-selector" v-if="envs.length > 0">
    <b-form-select v-model="env" size="sm" class="mt-3">
      <option v-for="env in envs" :value="env" :key="env.name">{{env.name}}</option>
    </b-form-select>
    <!-- <b-input-group size="sm">
      <b-form-input type="text" aria-label="Connection URL" :value="chainUrl"></b-form-input>

      <b-input-group-append>
        <b-dropdown variant="dark" size="sm">
          <b-dropdown-item-button
            v-for="(chain, index) in Object.keys(allowedUrls)"
            :key="`chain-${index}`"
            @click="addChainUrl({id: chain})"
          >
            <span>
              <strong>{{ index + 1 }}</strong>
              {{ chain }} : {{allowedUrls[chain]["dappchainEndpoint"] }}
            </span>
          </b-dropdown-item-button>
        </b-dropdown>
      </b-input-group-append>
    </b-input-group>-->
  </div>
</template>
<style lang="scss">
#chain-selector {
  .dropdown-menu {
    transform: translate3d(-224px, 31px, 0px) !important;
  }
}
</style>
