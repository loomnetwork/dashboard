<template>
  <b-modal id="redelegate-modal" ref="modalRef" title="Redelegate" hide-footer centered no-close-on-backdrop
  no-close-on-esc>
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
      <v-autocomplete :items="targetDelegations"
                      v-model="selectedTargetDelegation"
                      :get-label="getDelegationLabel"
                      :component-item="dropdownDelegationTemplate">
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
import RedelegateDelegationDropdownTemplate from './RedelegateDelegationDropdownTemplate'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'

const DPOSStore = createNamespacedHelpers('DPOS')
const DappChainStore = createNamespacedHelpers('DappChain')
const applicationStore = createNamespacedHelpers('applicationStore')

@Component({
  components: {
    LoadingSpinner,
    RedelegateDropdownTemplate,
    RedelegateDelegationDropdownTemplate
  },
  computed: {
    ...DappChainStore.mapState([
      "validators",
    ]),
    ...DPOSStore.mapState([
      "delegations"
    ])
  },
  methods: {
    ...DPOSStore.mapActions([
      "redelegateAsync"
    ]),
    ...DappChainStore.mapActions([
    ]),
    ...applicationStore.mapActions([
      "addBlockingTask",
      "removeBlockingTask",
    ]),
    ...DPOSStore.mapMutations([
      "setShowLoadingSpinner"
    ])
  }
})
export default class RedelegateModal extends Vue {

  dropdownTemplate = RedelegateDropdownTemplate
  dropdownDelegationTemplate = RedelegateDelegationDropdownTemplate
  filteredTargetItems = []
  delegation = null
  targetDelegations = []
  selectedTargetDelegation = null
  origin = {}
  target = {}

  errorMsg = ""
  originErrorMsg = ""

  show(delegation) {
    const originAddr = delegation.validatorStr
    this.delegation = delegation
    this.origin = this.validators.find(v => v.address === originAddr)
    this.updateTargetItems()
    this.$refs.modalRef.show()
  }

  async okHandler() {

    if(!this.target.address) {
      this.errorMsg = "Please select both a target and an origin validator"
      return
    }
    if(this.origin.address === this.target.address) {
      this.errorMsg = "Cannot redelegate to the same validator"
      return
    }

    this.setShowLoadingSpinner(true)
    await this.redelegateAsync({
      origin: this.origin.address, 
      target: this.target.address, 
      amount: this.delegation.amount})

    this.setShowLoadingSpinner(false)
    // this.$emit("ok")
    this.$refs.modalRef.hide()

  }  

  getLabel(item) {
    return item ? item.name : ""
  }

  getDelegationLabel(item) {
    return item ? item.index : ""
  }

  updateTargetItems(query) {
    const validators = this.validators.filter(v => !v.isBootstrap)
    const origin = this.origin
    const str = (query||"").toLowerCase()
    if(str.length > 0) {
      this.filteredTargetItems = validators.filter((item) => 
        origin != item &&
        item.name.toLowerCase().includes(str)
      )
    } else {
      this.filteredTargetItems = validators.filter((item) =>
        origin != item
      )
    }
  }

  selectTargetItem(validator) {
    this.target = validator
    this.targetDelegations = this.validatorDelegations()
    debugger
  }

  validatorDelegations() {
    if (!this.target || this.delegations.length <= 0) return
    const validator = this.target
    return this.delegations
      .filter(d => d.validatorStr === validator.address)
      .map((d, idx) => { 
        d.locked = parseInt(d.lockTime,10)*1000 > Date.now()
        d.index = (idx + 1)
        return d
      })
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
