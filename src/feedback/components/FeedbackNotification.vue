<template>
  <b-alert :show="show" :variant="type" fade>
    {{ message }}
    <b-button-close @click="close"/>
  </b-alert>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { feedbackModule } from "@/feedback/store"

@Component
export default class FeedbackNotification extends Vue {

  get message() {
    return this.$store.state.feedback.notification.message
  }

  get show() {
    return !!this.$store.state.feedback.notification.message
  }

  get type() {
    return this.$store.state.feedback.notification.type
  }

  close() {
    this.$store.state.feedback.notification.message = ""
  }
}
</script>
