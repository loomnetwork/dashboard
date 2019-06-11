<template>
  <b-modal v-model="visible"
    hide-footer
    no-close-on-backdrop 
    no-close-on-esc
    hide-header-close
    id="progress" :title="task">
    
    <section v-if="status === 'default'">
      <transition-group  name="list"
                        tag="ul"
                        enter-active-class="animated fadeIn"
                        leave-active-class="animated fadeOut">
        <li v-for="i in steps.length" :key="i" class="mb-3 pt-3">
          <div class="icon-container mr-2">
            <Checkmark v-if="i-1 < currentStep"/>
            <b-spinner variant="primary" label="Spinning" v-else/>
          </div>
          <span>{{ steps[i-1] }}</span>
        </li>
      </transition-group>
    </section>
    <section v-if="status === 'error'">
      <div class="lead">
        <p>An error occurred, please try again.</p>
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
    return this.$store.state.feedback.task
  }

  get steps() {
    return this.$store.state.feedback.steps
  }

  get currentStep() {
    return this.$store.state.feedback.currentStep
  }

  get visible() {
    return !!this.$store.state.feedback.task
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
    ul {
      li {
        list-style: none;
        display: flex;
        align-items: center;
        span {
          font-weight: bold;
          color: #bdbcbc;
        }
      }
    }
    .icon-container {
      display: inline-block;
    }
  }
</style>
