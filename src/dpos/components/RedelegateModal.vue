<template>
  <b-modal
    lazy
    id="redelegate-modal"
    ref="modalRef"
    :title="$t('components.modals.faucet_redelegate_modal.redelegate')"
    v-model="visible"
    hide-footer
    no-close-on-backdrop
    no-close-on-esc
  >
    <h6>{{ $t('components.modals.faucet_redelegate_modal.select_validator') }} {{ itemSelected }}</h6>
    <b-input :placeholder="$t('input_placeholder.search')" type="search" @input="onInput" class="mb-2"></b-input>
    <b-list-group flush class="mb-4">
      <b-list-group-item
        class="flex-column align-items-start"
        v-for="validator in items" :key="validator.name"
        :class="{active: validator.name === itemSelected}"
        @click="onItemClicked(validator)"
      >
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">{{ validator.name }}</h6>
          <small>{{ $t('components.modals.faucet_redelegate_modal.fee') }} {{ validator.fee }}%</small>
        </div>

        <span>
          <small>{{ $t('components.modals.faucet_redelegate_modal.total_stake') }}: {{ validator.totalStaked | tokenAmount }}</small>
        </span>
      </b-list-group-item>
      <div v-if="items.length === 0" class="not-found">
        {{ $t('components.modals.faucet_redelegate_modal.no_validator') }}
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
        >{{ $t('components.modals.faucet_redelegate_modal.redelegate') }}</b-button>
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
  itemSelected = ""
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
    return this.state.dpos.validators.filter((validator) =>
        !validator.isBootstrap &&
        !validator.jailed &&
        !validator.isFormer)
  }

  get delegation() {
    return this.state.dpos.delegation
  }

  async redelegate() {
    this.errorMsg = ""
    const delegation = this.delegation!
    if (delegation.updateValidator === undefined) {
      this.errorMsg = this.$t("components.modals.faucet_redelegate_modal.target_error").toString()
      return
    }
    if (delegation.validator === delegation.updateValidator) {
      this.errorMsg = this.$t("components.modals.faucet_redelegate_modal.same_target_error").toString()
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
        !validator.jailed &&
        !validator.isFormer &&
        origin !== validator.addr &&
        validator.name.toLowerCase().includes(str),
      )
    } else {
      this.items = validators.filter((validator) =>
        !validator.isBootstrap &&
        !validator.jailed &&
        origin !== validator.addr,
      )
    }
    this.items.sort((a, b) => a.name.localeCompare(b.name))

    if (!this.items.map((validator) => validator.name).includes(this.itemSelected)) {
      this.delegation!.updateValidator = undefined
      this.itemSelected = ""
    }
  }

  onItemClicked(validator) {
    if (!this.visible) return
    this.errorMsg = ""
    this.delegation!.updateValidator = validator
    this.itemSelected = validator.name
    this.$forceUpdate()
  }

  resetModal() {
    dposModule.clearRequest()
    this.errorMsg = ""
    this.itemSelected = ""
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
