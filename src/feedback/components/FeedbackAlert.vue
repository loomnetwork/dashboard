<template>
  <b-modal v-model="visible"
    :title="title"
    :hide-footer="hideFooter"
    @ok="handleOk"
    @hide="close">

    {{ message }}
  </b-modal>
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { feedbackModule } from "@/feedback/store"

@Component
export default class FeedbackAlert extends Vue {
  get alert() {
    return this.$store.state.feedback.alert
  }

  get title() {
    return this.alert.title
  }

  get message() {
    return this.alert.message
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
