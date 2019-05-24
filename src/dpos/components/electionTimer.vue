<template>
  <div>
    <h5 v-if="timeLeft > 0" class="highlight">{{formattedTimeUntilElection}}</h5>
    <b-spinner v-else variant="primary" label="Spinning"/>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { dposModule } from "@/store/dpos"
import { DposState } from "../../types"
import { HasDPOSState } from "../../store/dpos/types"

@Component
export default class ElectionTimer extends Vue {

  get electionTime(): Date {
    return (this.$store.state as HasDPOSState).dpos.electionTime
  }

  timerRefreshInterval: number = 0
  timeLeft = 0
  electionCycleTimer = 0

  mounted() {
    this.updateTimeUntilElectionCycle()
    this.startTimer()
  }

  startTimer() {
    this.timerRefreshInterval = window.setInterval(() => this.decreaseTimer(), 1000)
  }

  async updateTimeUntilElectionCycle() {
    const millis = this.electionTime.getTime() - Date.now()
    this.timeLeft = Math.ceil(millis / 1000)
  }

  async decreaseTimer() {
    if (this.timeLeft > 0) {
    this.timeLeft--
    } else {
    this.updateTimeUntilElectionCycle()
    }
  }

  get formattedTimeUntilElection() {
    if (this.timeLeft > 0) {
      const date = new Date(0)
      date.setSeconds(this.timeLeft)
      return date.toISOString().substr(11, 8)
    } else {
      return ""
    }
  }

  destroyed() {
    if (this.timerRefreshInterval) clearInterval(this.timerRefreshInterval)
  }

}
</script>