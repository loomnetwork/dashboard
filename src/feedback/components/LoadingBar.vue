<template>
  <b-progress v-if="visible"
              :value="100"
              variant="info"
              class="progress-bar"
              striped
              :animated="true">
    <b-progress-bar :value="100">
      <strong class="progress-copy">
        {{ $t("messages.awaiting_transaction") }}
      </strong>
    </b-progress-bar>
  </b-progress>  
</template>
<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { feedbackModule } from "@/feedback/store"

@Component
export default class LoadingBar extends Vue {

  get visible() {
    return this.$store.state.feedback.isLoading
  }

}
</script>

<style scoped lang="scss">

  .progress-bar {
    width: 100%;
    height: 36px;
    .progress-copy {
      font-size: 1.1em;
    }
  }

</style>
