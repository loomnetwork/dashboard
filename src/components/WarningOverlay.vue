<template>
  <div>

    <div v-if="type === 'metamask'">
      <div v-if="metamaskDisabled && userIsLoggedIn" class="disabled-overlay">
        <div>           
          <div class="network-error-container mb-3">
            <img src="../assets/metamask-error-graphic.png"/>
          </div>
          <h4>
            {{ $t('components.layout.metamask_error') }}
          </h4>
          <div>
            <span>
              {{ $t('components.layout.please_enable_metamask_or_switch') }}
            </span>
          </div>              
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="mappingStatus == 'INCOMPATIBLE_MAPPING' && userIsLoggedIn" class="disabled-overlay">
        <div>           
          <div class="network-error-container mb-3">
            <img src="../assets/network-error-graphic.png"/>
          </div>
          <h4>
            {{ $t('components.layout.mapping_error') }}
          </h4>
          <div v-if="mappingError">

            {{ $t('components.layout.your_account_appears_to_be') }} <br>
            <span class="address">{{mappingError.mappedEthAddress}}</span> <br>
            {{ $t('components.layout.but_your_current_account_address') }} <br>
            <span class="address">{{mappingError.metamaskAddress}}</span> <br>
            {{ $t('components.layout.please_change_your_metamask_account') }}

          </div>
          <div v-else>
            <span>
              {{ $t('components.layout.please_check_your_metamask_account') }}
            </span>
          </div>              
        </div>
      </div>        
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapActions, mapMutations, mapState, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  props: {
    type: String
  },
  computed: {
    ...mapState([
      'userIsLoggedIn'
    ]),
    ...DappChainStore.mapState([
      'account',
      'metamaskStatus',
      'metamaskError',
      'mappingStatus',
      'mappingError'
    ]),  
    ...DPOSStore.mapState([
      'metamaskDisabled'
    ])    
  }
})
export default class WarningOverlay extends Vue {
}
</script>
<style scoped lang="scss">

  .disabled-overlay {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    justify-content: center;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(255,255,255,0.8);    
    z-index: 200;
    text-align: center;
    h4 {
      color: #eb2230 !important;
      margin-bottom: 6px;
    }
    .address {
      color: #5756e6;
      background-color: #ffd1de;
      border-radius: 3px;
      padding: 3px 6px;
      font-weight: bold;
    }
    .network-error-container {
      width: 180px;
      height: 180px;
      margin: 0 auto;
      overflow: hidden;
      border: 4px solid #5756e6;
      border-radius: 50%;
      background: rgb(238,174,202);
      background: radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);   
      img {      
        height: 180px;
      }
    }
  }  

</style>


</style>