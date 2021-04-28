<template>
  <b-modal
    v-model="visible"
    :title="$t(title)"
    :no-close-on-backdrop="isConfirmation"
    :no-close-on-esc="isConfirmation"
    :hide-header-close="isConfirmation"
    :hide-footer="hideFooter"
    @ok="handleOk"
    @hide="close"
  >
    {{ $t(message) }}
    <template #modal-footer="{ ok }">
      <b-button variant="primary" @click="ok()"> OK </b-button>
    </template>
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { feedbackModule } from "@/feedback/store"
import { isAfter } from "date-fns"

@Component
export default class FeedbackAlert extends Vue {
  get alert() {
    return this.$store.state.feedback.alert
  }

  get title() {
    return this.alert.title
  }

  get message() {
    return Array.isArray(this.alert) ?
      this.$t(this.alert[0], this.alert[1]) :
      this.$t(this.alert.message)
  }

  get visible() {
    return !!this.alert.message
  }

  set visible(val: boolean) {
    console.log("set visible...")
  }

  get hideFooter() {
    return this.alert.type === "alert" ? true : false
  }

  get isConfirmation() {
    return this.alert.type === "confirmation"
  }

  handleOk() {
    this.alert.onConfirm()
  }

  close() {
    this.alert.type = "alert"
    this.alert.title = ""
    this.alert.message = ""
    this.alert.onConfirm = () => { return }
  }
}
</script>
