<template>
  <b-modal
    v-model="visible"
    hide-footer
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    id="withdraw-progress"
    title="Withdrawal progress"
  >
    <section v-if="status === 'default'">
      <transition-group
        name="list"
        tag="ul"
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <li v-for="(stage, idx) in visibleStates" :key="`stage-${idx}`" class="mb-3 pt-3">
          <div class="icon-container mr-2">
            <Checkmark v-if="stage.isComplete"/>
            <b-spinner variant="primary" label="Spinning" v-else/>
          </div>
          <span>{{stage.text}}</span>
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
import { Component, Watch } from "vue-property-decorator"
import { ethers } from "ethers"

import { formatToCrypto } from "@/utils"
import { DashboardState } from "../../types"
import { gatewayModule } from "../../store/gateway"
import { gatewayReactions } from "../../store/gateway/reactions"
import { setShowWithdrawProgress, incrementWithdrawStateIdx } from "../../store/gateway/mutations"

import Checkmark from "@/components/Checkmark.vue"

@Component({
  components: {
    Checkmark,
  },
})
export default class WithdrawProgress extends Vue {

  status = "default"
  states = this.state.gateway.withdrawStates
  withdrawStateIdx = this.state.gateway.withdrawStateIdx
  setShowWithdrawProgress = gatewayModule.setShowWithdrawProgress
  incrementWithdrawStateIdx = gatewayModule.incrementWithdrawStateIdx
  setWithdrawStateAsCompleted = gatewayModule.setWithdrawStateAsCompleted
  stateGenerator = () => { }

  mounted() {
    this.stateGenerator = this.createGenerator()
  }

  createGenerator() {
    return function* generatorFunction() {
      let index = 0
      while (index < index + 1) {
        yield index++
      }
    }
  }

  get state(): DashboardState {
    return this.$store.state
  }

  get currentState() {
    return this.state.gateway.withdrawStateIdx
  }

  get visibleStates() {
    return this.states.slice(0, this.currentState)
  }

  get visible() {
    return this.state.gateway.showWithdrawProgress
  }

  set visible(value) {
    if (value === false) {
      this.setShowWithdrawProgress(false)
    }
  }

  close() {
    this.visible = false
  }

}
</script>

<style scoped lang="scss">
#withdraw-progress {
  ul {
    li {
      list-style: none;
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
