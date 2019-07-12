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
    <h6>Select a validator:</h6>
    <b-input placeholder="Search..." type="search" @input="onInput" class="mb-2"></b-input>
    <b-list-group flush class="mb-4">
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
      <div v-if="items.length === 0" class="not-found">
        No validator found.
      </div>
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
  items: Validator[] = []

  mounted() {
    this.$root.$on("bv::modal::show", () => {
      this.onInput("")
    })
  }

  get visible() {
    const dpos = this.state.dpos
    return dpos.intent === "redelegate" && dpos.delegation != null
  }

  set visible(val: boolean) {
    // clear
    if (val === false) {
      this.resetModal()
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
    this.resetModal()
  }

  onInput(value) {
    if (!this.visible) return []
    const validators = this.validators
    const origin = this.delegation!.validator.addr
    const str = value.toLowerCase()
    if (value.length > 0) {
      this.items = validators.filter((validator) =>
        !validator.isBootstrap &&
        origin !== validator.addr &&
        validator.name.toLowerCase().includes(str),
      ).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    } else {
      this.items = validators.filter((validator) =>
        !validator.isBootstrap &&
        origin !== validator.addr,
      ).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    }
  }

  onItemClicked(validator, index) {
    if (!this.visible) return
    this.errorMsg = ""
    this.delegation!.updateValidator = validator
    this.itemSelected = index
    this.$forceUpdate()
  }

  resetModal() {
    dposModule.clearRequest()
    this.errorMsg = ""
    this.itemSelected = -1
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

.list-group {
  height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.list-group-item {
  cursor: pointer;

  &:first-of-type {
    border-top: 0;
  }
}

.not-found {
  cursor: default;
  text-align: center;
  padding: 0.75rem;
}
</style>
