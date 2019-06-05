<script lang="ts" src="./ChainSelector.ts">
</script>
<template>
  <div id="chain-selector" v-if="envs.length > 0">
    <b-form-select v-model="envName" size="sm" class="mt-3">
      <option v-for="(env,index) in envs" :value="env" :key="index">{{env}}</option>
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
