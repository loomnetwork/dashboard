<template>
  <b-alert
    :show="show"
    :variant="type"
    dismissible
    @dismiss-count-down="countDownChanged"
    fade>
  {{ message }}
  </b-alert>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { feedbackModule } from "@/feedback/store"

@Component
export default class FeedbackNotification extends Vue {
  dismissCountDown = 2

  get message() {
    return this.$store.state.feedback.notification.message
  }

  get show() {
    return !!this.$store.state.feedback.notification.message && this.dismissCountDown
  }

  get type() {
    return this.$store.state.feedback.notification.type
  }

  countDownChanged(dismissCountDown) {
    this.dismissCountDown = dismissCountDown

    if (dismissCountDown === 0) {
      this.$store.state.feedback.notification.message = ""
      this.dismissCountDown = 2
    }
  }
}
</script>
