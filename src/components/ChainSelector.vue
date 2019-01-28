<template>
  <div id="chain-selector">

<!-- 
  <b-dropdown size="sm" :text="chainUrl" @change="setUrl">
    <b-dropdown-item-button v-for="(chain, index) in allowedUrls"
      :key="index"
      @click="onUrlClicked(chain.websockt || chain.rpc || '')">
      {{chain.websockt || chain.rpc || ''}}
    </b-dropdown-item-button>
  </b-dropdown> -->
<!-- 

  <b-form-group>
    <b-form-select id="chainSelector"
                  :options="allowedUrls"
                  required
                  :value="chainUrl"
                  @change="setUrl">
    </b-form-select>
  </b-form-group> -->


    <b-input-group size="sm">
      <b-form-input type="url" aria-label="Connection URL" :value="chainUrl" @change="setUrl">
      </b-form-input>
      <b-input-group-append>
        <b-dropdown variant="dark" size="sm">
          <b-dropdown-item-button v-for="(chain, index) in allowedUrls"
            :key="index"
            @click="onUrlClicked(chain.websockt || chain.rpc || '')">
            {{chain.websockt || chain.rpc || ''}}
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
<script lang="ts" src="./chain-selector.ts"></script>