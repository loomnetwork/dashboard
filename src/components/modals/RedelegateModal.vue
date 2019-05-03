<template>
  <b-modal id="redelegate-modal" ref="modalRef" title="Redelegate" @hidden="clear" hide-footer no-close-on-backdrop
  no-close-on-esc>
    <strong v-if="originErrorMsg" class="error-message mb-4">{{originErrorMsg}}</strong>
    <strong>To</strong>
    <div class="dropdown-container mb-4">
      <v-autocomplete class="mb-4"
                      v-model="target"
                      placeholder="Please select a validator"
                      :items="filteredTargetItems"
                      :get-label="getLabel"
                      :component-item="dropdownTemplate"
                      @item-selected="selectTargetItem"
                      @update-items="updateTargetItems">
      </v-autocomplete>
      <!-- <v-autocomplete v-if="targetDelegations.length > 0"
                      v-model="selectedTargetDelegation"
                      :items="targetDelegations"
                      :get-label="getDelegationLabel"
                      :component-item="dropdownDelegationTemplate">
      </v-autocomplete>       -->

      <!-- <b-list-group v-if="targetDelegations.length > 0">
        <b-list-group-item class="delegations-list-item"
                           :class="selectedTargetDelegation === delegation.index ? 'active-delegations-list-item' : '' ||
                           delegation.state !== 1 ? 'disabled-delegations-list-item' : ''"
                           v-for="(delegation, idx) in targetDelegations" 
                           :key="delegation + ' ' + idx"
                           @click="selectDelegation(delegation)">
          <div class="row">
            <div class="col-sm-2 text-left">
              <strong>{{delegation.index}}</strong>
            </div>
            <div class="col-sm-4 text-left">
              <strong>Amount: </strong><span>{{delegation.amount | tokenAmount}}</span>
            </div>
            <div class="col-sm-6 text-left">
              <strong>Locktime: </strong><span>{{delegation.lockTime | readableDate}}</span>
            </div>      
          </div>
        </b-list-group-item>
      </b-list-group> -->

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

  clear() {
    this.delegation = null
    this.targetDelegations = []
    this.selectedTargetDelegation = null
    this.origin = {}
    this.target = {}
  }

  async okHandler() {
    this.errorMsg = ""
    if(!this.target.address) {
      this.errorMsg = "Please select both a target and an origin validator"
      return
    }
    if(this.origin.address === this.target.address) {
      this.errorMsg = "Cannot redelegate to the same validator"
      return
    }

    this.setShowLoadingSpinner(true)
    
    let payload = {
      origin: this.origin.address, 
      target: this.target.address, 
      amount: this.delegation.amount,
      index: this.delegation.index
    }

    await this.redelegateAsync(payload)

    this.setShowLoadingSpinner(false)
    // this.$emit("ok")
    this.closeModal()

  }  

  closeModal() {
    this.clear()
    this.$refs.modalRef.hide()
  }

  getLabel(item) {
    return item ? item.name : "Please select a validator"
  }

  getDelegationLabel(item) {
    return item ? item.index : "Please select a delegation"
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
  }

  selectDelegation(delegation) {
    if(this.selectedTargetDelegation === delegation.index) {
      this.selectedTargetDelegation = null
      return
    }
    if(delegation.state !== 1) {
     this.errorMsg = "The selected delegation is in a bonding state, please try again later." 
    } else {
      this.selectedTargetDelegation = delegation.index
    }
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
    z-index: 9;
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

.delegations-list-item {
  cursor: pointer;
}

.delegations-list-item:hover {
  background-color: #007bff;
  color: #ffffff;
}

.active-delegations-list-item {
  background-color: #007bff;
  color: #ffffff;  
}

.disabled-delegations-list-item {
  opacity: 0.5;
  pointer-events: none !important;
  cursor: not-allowed;
}

</style>
