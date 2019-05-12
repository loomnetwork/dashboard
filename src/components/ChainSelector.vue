<script lang="ts" src="./ChainSelector.ts"></script>
<template>
  <div id="chain-selector">
    <b-input-group size="sm">
      <b-form-input type="text" aria-label="Connection URL" :value="chainUrl" @change="setUrl">
      </b-form-input>
      <b-input-group-append>
        <b-dropdown variant="dark" size="sm">
          <b-dropdown-item-button v-for="(chain, index) in Object.keys(allowedUrls)"
                                  :key="`chain-${index}`"
                                  @click="onUrlClicked(chain)">            
            <span>
              <strong>{{ index + 1 }}</strong>
              {{ chain }} : {{allowedUrls[chain]["dappchainEndpoint"] }}
            </span>
          </b-dropdown-item-button>
        </b-dropdown>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>
<style lang="scss">
  #chain-selector {
    .dropdown-menu {
      transform: translate3d(-224px, 31px, 0px) !important;
    }
  }

</style>
