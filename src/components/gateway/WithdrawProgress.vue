<template>
  <b-modal v-model="visible"
    hide-footer
    no-close-on-backdrop 
    no-close-on-esc
    hide-header-close
    id="withdraw-progress"  title="Complete deposit">


    <transition-group  name="list"
                       tag="ul"
                       enter-active-class="animated fadeIn"
                       leave-active-class="animated fadeOut">
      <li v-for="(stage, idx) in visibleStates" :key="`stage-${idx}`" class="mb-3 pt-3">
        <div class="icon-container mr-2">
          <Checkmark v-if="stage.isComplete"/>
          <b-spinner variant="primary" label="Spinning" v-else/>
        </div>
        <span>{{stage.text}}</span>
      </li>
    </transition-group>

    <button @click="increment">
      Increment
    </button>    

  </b-modal>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import {ethers} from "ethers"

import { formatToCrypto } from "@/utils"
import { DashboardState } from "../../types"
import { DPOSTypedStore } from "../../store/dpos-old"
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

  states = this.state.gateway.withdrawStates
  withdrawStateIdx = this.state.gateway.withdrawStateIdx
  setShowWithdrawProgress = gatewayModule.setShowWithdrawProgress
  incrementWithdrawStateIdx = gatewayModule.incrementWithdrawStateIdx
  setWithdrawStateAsCompleted = gatewayModule.setWithdrawStateAsCompleted

  get state(): DashboardState {
    return this.$store.state
  }

  get currentState() {
    return this.state.gateway.withdrawStateIdx
  }

  get visibleStates() {
    return this.states.slice(0, this.currentState)
  }

  increment() {
    this.incrementWithdrawStateIdx()
    this.setWithdrawStateAsCompleted()
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
