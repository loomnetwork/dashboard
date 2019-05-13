<template>
  <b-modal id="success-modal" ref="modalRef" title="Create Account" hide-footer centered no-close-on-backdrop>
    <b-container fluid>
      <h1>
        {{ $t('components.modals.success_modal.success') }}
      </h1>
    </b-container>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"

@Component
export default class SuccessModal extends Vue {}
</script>
<style lang="scss">

</style>
