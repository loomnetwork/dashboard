<template>
  <b-modal
    id="redelegate-modal"
    ref="modalRef"
    title="Redelegate"
    v-model="visible"
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
import { dposModule } from '../../store/dpos';
import { Validator } from '../../store/dpos/types';

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
  filteredTargetItems: Validator[] = []

  errorMsg = ""
  originErrorMsg = ""

  get visible() {
    const dpos = this.state.dpos
    return dpos.intent === "redelegate" && dpos.delegation != null
  }

  set visible(val: boolean) {
    // clear
  }

  get sourceDelegation() {
    return this.state.dpos.delegation
  }

  setShowLoadingSpinner = DPOSTypedStore.setShowLoadingSpinner

  get state(): DashboardState {
    return this.$store.state
  }

  get validators() {
    return this.state.dpos.validators
  }
  get delegations() {
    return this.state.dpos.delegations
  }

  get delegation() {
    return this.state.dpos.delegation
  }

  async okHandler() {
    this.errorMsg = ""
    const delegation = this.delegation!
    if (delegation.updateValidator === undefined) {
      this.errorMsg = "Please select a target validator"
      return
    }
    if (delegation.validator === delegation.updateValidator) {
      this.errorMsg = "Cannot redelegate to the same validator"
      return
    }

    dposModule.redelegate(delegation)

  }

  getLabel(item) {
    return item ? item.name : "Please select a validator"
  }

  updateTargetItems(query = "") {
    const validators = this.validators
    const origin = this.delegation!.validator
    const str = query.toLowerCase()
    if (str.length > 0) {
      this.filteredTargetItems = validators.filter((item) =>
        !item.isBootstrap &&
        origin !== item &&
        item.name.toLowerCase().includes(str),
      )
    } else {
      this.filteredTargetItems = validators.filter((item) =>
        !item.isBootstrap &&
        origin !== item,
      )
    }
  }

  selectTargetItem(validator) {
    this.errorMsg = ""
    this.delegation!.updateValidator = validator
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
