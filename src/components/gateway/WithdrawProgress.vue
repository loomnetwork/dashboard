<template>
  <b-modal v-model="visible"
    hide-footer
    no-close-on-backdrop 
    no-close-on-esc
    hide-header-close
    id="withdraw-progress"  title="Complete deposit">

    <ul>
      <li v-for="(stage, idx) in stages" :key="`stage-${idx}`">
        <div class="icon-container">
          <Checkmark v-if="stage.isComplete"/>
          <b-spinner variant="primary" label="Spinning" v-else/>
        </div>
        <span>{{stage}}</span>
      </li>
    </ul>
    

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
import { setShowWithdrawProgress } from "../../store/gateway/mutations"

import Checkmark from "@/components/Checkmark.vue"

@Component({
  components: {
    Checkmark,
  },
})
export default class WithdrawProgress extends Vue {

  setShowWithdrawProgress = gatewayModule.setShowWithdrawProgress

  get state(): DashboardState {
    return this.$store.state
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
  }
</style>
