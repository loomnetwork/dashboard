<template>
  <b-modal
    id="redelegate-modal"
    ref="modalRef"
    title="Redelegate"
    @hidden="clear"
    hide-footer
    no-close-on-backdrop
    no-close-on-esc
  >
    <strong v-if="originErrorMsg" class="error-message mb-4">{{originErrorMsg}}</strong>
    <strong>To</strong>
    <div class="dropdown-container mb-4">
      <v-autocomplete
        class="mb-4"
        v-model="target"
        placeholder="Please select a validator"
        :items="filteredTargetItems"
        :get-label="getLabel"
        :component-item="dropdownTemplate"
        @item-selected="selectTargetItem"
        @update-items="updateTargetItems"
      ></v-autocomplete>
    </div>
    <strong v-if="errorMsg" class="error-message mb-4">{{errorMsg}}</strong>
    <div class="row">
      <div class="col btn-container">
        <b-button id="submitBtn" class="px-5 py-2" variant="primary" @click="okHandler">Redelegate</b-button>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import LoadingSpinner from "../../components/LoadingSpinner.vue"
import RedelegateDropdownTemplate from "./RedelegateDropdownTemplate.vue"
import RedelegateDelegationDropdownTemplate from "./RedelegateDelegationDropdownTemplate.vue"
import { DPOSTypedStore } from "@/store/dpos-old"
import { DashboardState } from "@/types"

@Component({
  components: {
    LoadingSpinner,
    RedelegateDropdownTemplate,
    RedelegateDelegationDropdownTemplate,
  },
})
export default class RedelegateModal extends Vue {

  dropdownTemplate = RedelegateDropdownTemplate
  dropdownDelegationTemplate = RedelegateDelegationDropdownTemplate
  filteredTargetItems: any[] = []
  delegation: any = null
  targetDelegations: any[] = []
  selectedTargetDelegation: any = null
  origin: any = {}
  target: any = {}

  errorMsg = ""
  originErrorMsg = ""

  setShowLoadingSpinner = DPOSTypedStore.setShowLoadingSpinner
  redelegateAsync = DPOSTypedStore.redelegateAsync

  get state(): DashboardState {
    return this.$store.state
  }

  get validators() {
    return this.state.DPOS.validators
  }
  get delegations() {
    return this.state.DPOS.delegations
  }

  show(delegation) {
    const originAddr = delegation.validatorStr
    this.delegation = delegation
    this.origin = this.validators.find((v) => v.address === originAddr)
    this.updateTargetItems()
    // @ts-ignore
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
    if (!this.target.address) {
      this.errorMsg = "Please select a target validator"
      return
    }
    if (this.origin.address === this.target.address) {
      this.errorMsg = "Cannot redelegate to the same validator"
      return
    }

    this.setShowLoadingSpinner(true)

    const payload = {
      origin: this.origin.address,
      target: this.target.address,
      amount: this.delegation!.amount,
      index: this.delegation!.index,
    }

    await this.redelegateAsync(payload)

    this.setShowLoadingSpinner(false)
    // this.$emit("ok")
    this.closeModal()

  }

  closeModal() {
    this.clear()
    // @ts-ignore
    this.$refs.modalRef.hide()
  }

  getLabel(item) {
    return item ? item.name : "Please select a validator"
  }

  getDelegationLabel(item) {
    return item ? item.index : "Please select a delegation"
  }

  updateTargetItems(query = "") {
    const validators = this.validators.filter((v) => !v.isBootstrap)
    const origin = this.origin
    const str = query.toLowerCase()
    if (str.length > 0) {
      this.filteredTargetItems = validators.filter((item) =>
        origin !== item &&
        item.name.toLowerCase().includes(str),
      )
    } else {
      this.filteredTargetItems = validators.filter((item) =>
        origin !== item,
      )
    }
  }

  selectTargetItem(validator) {
    this.errorMsg = ""
    this.target = validator
  }

  selectDelegation(delegation) {
    if (this.selectedTargetDelegation === delegation.index) {
      this.selectedTargetDelegation = null
      return
    }
    if (delegation.state !== 1) {
      this.errorMsg = "The selected delegation is in a bonding state, please try again later."
    } else {
      this.selectedTargetDelegation = delegation.index
    }
  }

  validatorDelegations() {
    if (!this.target || this.delegations.length <= 0) return
    const validator = this.target
    return this.delegations
      .filter((d) => d.validatorStr === validator.address)
      .map((d, idx) => {
        d.locked = parseInt(d.lockTime, 10) * 1000 > Date.now()
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
