<template>
  <b-modal id="redelegate-modal" ref="modalRef" title="Redelegate" hide-footer centered no-close-on-backdrop>
    <div v-if="isLoading" class="pb-4">
      <loading-spinner :showBackdrop="true"></loading-spinner>
    </div>      
    <strong>From</strong>
    <div class="dropdown-container mb-4">
      <v-autocomplete :items="filteredOriginItems"
                      v-model="origin"
                      :get-label="getLabel"
                      :component-item="dropdownTemplate"
                      @item-selected="selectOriginItem"
                      @update-items="updateOriginItems">
      </v-autocomplete>
    </div>
    <strong v-if="originErrorMsg" class="error-message mb-4">{{originErrorMsg}}</strong>
    <strong>To</strong>
    <div class="dropdown-container mb-4">
      <v-autocomplete :items="filteredTargetItems"
                      v-model="target"
                      :get-label="getLabel"
                      :component-item="dropdownTemplate"
                      @item-selected="selectTargetItem"
                      @update-items="updateTargetItems">
      </v-autocomplete>
    </div>      
    <strong v-if="errorMsg" class="error-message mb-4">{{errorMsg}}</strong>    
    <div class="row">
      <div class="col btn-container">
        <b-button id="submitBtn" class="px-5 py-2" variant="primary" @click="okHandler">Redelegate</b-button>
      </div>
    </div>

  </b-modal>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import LoadingSpinner from '../../components/LoadingSpinner'
import RedelegateDropdownTemplate from './RedelegateDropdownTemplate'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

const DPOSStore = createNamespacedHelpers('DPOS')
const DappChainStore = createNamespacedHelpers('DappChain')

@Component({
  props: {
     validators: { required: true }
  },
  components: {
    LoadingSpinner,
    RedelegateDropdownTemplate
  },
  computed: {
    ...DPOSStore.mapState([
      "validatorFields"
    ])
  },
  methods: {
    ...DPOSStore.mapActions([
      "getValidatorList",
      "redelegateAsync"
    ]),
    ...DappChainStore.mapActions([
      "checkDelegationAsync"
    ])
  }
})

export default class RedelegateModal extends Vue {

  dropdownTemplate = RedelegateDropdownTemplate

  filteredOriginItems = []
  filteredTargetItems = []
  origin = {}
  target = {}
  isLoading = false
  originHasDelegation = false

  errorMsg = ""
  originErrorMsg = ""

  async show() {
    if(this.validators.length <= 0 ) return
    this.filteredOriginItems = this.validators
    this.filteredTargetItems = this.validators
    this.$refs.modalRef.show()
  }

  okHandler() {

    if(!this.origin.Address || !this.target.Address) {
      this.errorMsg = "Please select both a target and an origin validator"
      return
    }
    if(this.origin.Address === this.target.Address || !this.originHasDelegation) {
      this.errorMsg = "Cannot redelegate to the same validator"
      return
    }

    this.$emit('ok')
    this.$refs.modalRef.hide()
  }  

  getLabel(item) {
    if(!item) return
    return item.Name
  }

  updateOriginItems(query) {

    if(query) {
      this.filteredOriginItems = this.validators.filter((item) => {
        return item.Name.toLowerCase().includes(query.toLowerCase())
      })
    } else {
      this.resetOriginItems()
    }

  }

  updateTargetItems(query) {

    if(query) {
      this.filteredTargetItems = this.validators.filter((item) => {
        return item.Name.toLowerCase().includes(query.toLowerCase())
      })
    } else {
      this.resetTargetItems()
    }

  }

  resetOriginItems() {
    this.filteredTargetItems = this.validators
  }

  resetTargetItems() {
    this.filteredTargetItems = this.validators
  }

  async selectOriginItem(item) {
    if(!item) return
    const {pubKey} = item
    if(!pubKey) return
    this.isLoading = true
    const delegation = await this.queryDelegation(pubKey)
    this.originHasDelegation = parseInt(delegation.amount) > 0 ? true : false
    this.originErrorMsg = !this.originHasDelegation ? "You don't have any existing delegations on this validator" : "" 
    this.isLoading = false
  }

  async selectTargetItem(item) {
    this.errorMsg = ""
  }

  async queryDelegation(pubKey) {
    try {
      return await this.checkDelegationAsync({validator: pubKey})
    } catch(err) {
      console.error(err)
      return
    }
  }
  
}
</script>
<style lang="scss">

.btn-container {
  display: flex;
  .submit-btn {
    margin-left: auto;
  }
}

.error-message {
  color: red;
  display: block;
}

.dropdown-container {
  width: 100%;
  .v-autocomplete {
    width: 100%;
    input {
      width: 100%;
      border: 2px solid #f2f1f3;
      padding: 4px 12px;
    }
  }
  .v-autocomplete-list {
    width: 100%;
    max-height: 240px;
    overflow-y: auto;
    z-index: 999;
    background-color: #ffffff;
    border: 2px solid #f2f1f3;
    .v-autocomplete-list-item {
      cursor: pointer;
      padding: 6px 12px;
      border-bottom: 2px solid #f2f1f3;
      text-align: center;
      &:last-child {
        border-bottom: none;
      }
      &:hover {
        background-color: #eeeeee;
      }
    }
  }
}
</style>
