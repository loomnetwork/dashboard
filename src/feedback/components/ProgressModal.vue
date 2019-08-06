<template>
  <b-modal
    v-model="visible"
    hide-footer
    no-close-on-backdrop
    no-close-on-esc
    hide-header
    id="progress"
    body-bg-variant="info"
    body-text-variant="dark"
  >
    <!--     :title="task" -->
    <section v-if="status === 'default'">
      <img src="@/assets/loomy-running.gif" class="looping-loomy mb-2" alt="loomy">

      <transition-group
        name="list"
        tag="ul"
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <li v-for="i in steps.length" :key="i" class="mb-2 pt-2">
          <div class="icon-container mr-3">
            <Checkmark v-if="i-1 < currentStep"/>
            <b-spinner variant="primary" label="Spinning" v-else/>
          </div>
          <span>{{ steps[i-1] }}</span>
        </li>
      </transition-group>
    </section>
    <section v-if="status === 'error'">
      <div class="lead">
        <p>{{ $t('messages.error_try_again') }}</p>
      </div>
    </section>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import { feedbackModule } from "@/feedback/store"
import Checkmark from "@/components/Checkmark.vue"

@Component({
  components: {
    Checkmark,
  },
})
export default class ProgressModal extends Vue {
  status = "default"

  get task() {
    return this.$store.state.feedback.progress.task
  }

  get steps() {
    return this.$store.state.feedback.progress.steps
  }

  get currentStep() {
    return this.$store.state.feedback.progress.currentStep
  }

  get visible() {
    return !!this.$store.state.feedback.progress.task
  }

  set visible(value) {
    if (value === false) {
      feedbackModule.endTask()
    }
  }
}
</script>

<style scoped lang="scss">
#progress {
  section {
    display: flex;
    flex-direction: column;
  }
  .looping-loomy {
    width: 100px;
    height: 100px;
    align-self: center;
  }
  ul {
    li {
      list-style: none;
      display: flex;
      align-items: center;
      span {
        font-weight: normal;
      }
    }
  }
  .icon-container {
    display: inline-block;
    > * {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
