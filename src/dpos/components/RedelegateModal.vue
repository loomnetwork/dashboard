<template>
  <b-modal
    lazy
    id="redelegate-modal"
    ref="modalRef"
    title="Redelegate"
    v-model="visible"
    hide-footer
    no-close-on-backdrop
    no-close-on-esc
  >
    <h6>Select a validator : {{ validatorSelected }}</h6>
    <b-list-group class="mb-4">
      <b-list-group-item
        class="flex-column align-items-start"
        v-for="(validator, index) in items" :key="index"
        :class="{active: index === itemSelected}"
        @click="onItemClicked(validator, index)"
      >
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{{ validator.name }}</h6>
          <small>Fee: {{ validator.fee }}%</small>
        </div>

        <span>
          <small>Total staked: {{ validator.totalStaked | tokenAmount }}</small>
        </span>
      </b-list-group-item>
    </b-list-group>
    <strong v-if="errorMsg" class="error-message mb-4">{{ errorMsg }}</strong>
    <footer class="row">
      <div class="col btn-container">
        <b-button
          id="submitBtn"
          class="px-5 py-2"
          variant="primary"
          @click="redelegate"
        >Redelegate</b-button>
      </div>
    </footer>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { dposModule } from "@/dpos/store"
import { Validator } from "@/dpos/store/types"

@Component
export default class RedelegateModal extends Vue {
  errorMsg = ""
  itemSelected = -1

  get visible() {
    const dpos = this.state.dpos
    return dpos.intent === "redelegate" && dpos.delegation != null
  }

  set visible(val: boolean) {
    // clear
    if (val === false) {
      dposModule.clearRequest()
      this.errorMsg = ""
      this.itemSelected = -1
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get validators() {
    return this.state.dpos.validators
  }

  get delegation() {
    return this.state.dpos.delegation
  }

  async redelegate() {
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
    // for now redelegate all
    delegation.updateAmount = delegation.amount
    dposModule.redelegate(delegation)
    dposModule.clearRequest()
  }

  get items() {
    if (!this.visible) return []
    return this.validators.filter((validator) =>
      !validator.isBootstrap &&
      this.delegation!.validator.addr !== validator.addr,
    )
  }

  onItemClicked(validator, index) {
    if (!this.visible) return
    this.errorMsg = ""
    this.delegation!.updateValidator = validator
    this.itemSelected = index
    this.$forceUpdate()
  }
}
</script>
<style lang="scss" scoped>
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

.list-group {
  max-height: 400px;
  overflow-y: scroll;
}

.list-group-item {
  cursor: pointer;
}
</style>
