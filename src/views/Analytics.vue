<template>
  <div class="container">
    <b-row>
      <b-col cols="8">
        <b-card>
          <b-row class="mb-3">
            <b-col class="card-label">
              <b-card-title>{{ $t('views.analytics.total_amount_staked') }}</b-card-title>
            </b-col>
            <b-col>
              <b-form-select class="period-select" size="sm" v-model="selected" id="dropdown-right" >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </b-form-select>
            </b-col>
          </b-row>
          <canvas id="barChart" width="600" height="280"></canvas>
        </b-card>
      </b-col>
      <b-col cols="4">
        <b-card :title="$t('views.analytics.tier_distribution')">
          <canvas id="pieChart" width="300" height="330"></canvas>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import Chart from "chart.js"
import { Component } from "vue-property-decorator"

import { DashboardState } from "../types"
import { dposModule } from "../dpos/store"
import BigNumber from "bignumber.js"

@Component
export default class Analytics extends Vue {

  allDelegationArray: any = []
  // 2 weeks / 3 months / 6 months / 1 year
  tierDistribution = [0, 0, 0, 0]
  selected = "daily"
  filteredArray: any = []

  get state(): DashboardState {
    return this.$store.state
  }

  get delegationArray() {
    this.state.dpos.validators.forEach((candidate) => {
      this.allDelegationArray.push(candidate.allDelegations)
    })
    this.allDelegationArray.forEach((validators) => {
      validators.filter((filtered) => {
        if (filtered.index !== 0) {
          this.tierDistribution[filtered.lockTimeTier] += 1
        }
      })
    })
    return this.tierDistribution
  }

  get fromDateDaily() {
    return this.getDaily().fromDate
  }

  get toDateDaily() {
    return this.getDaily().toDate
  }

  async beforeMount() {
    console.log("candidate delegations", this.allDelegationArray)
    if (!this.state.dpos.analyticsData) await dposModule.fetchAnalyticsData()
    const data = this.state.dpos.analyticsData!
    const ctx = document.getElementById("pieChart")
    const ctx2 = document.getElementById("barChart")
    const totalTiers = data[0].tiers
    const tierAmount: any[] = []
    const tiers = { zero: "2 weeks", one: "3 months", two: "6 months", three: "1 year" }
    const tierKeys: any[] = []
    for (const key of Object.keys(totalTiers)) {
      tierKeys.push(tiers[key])
      if (totalTiers.hasOwnProperty(key)) {
        tierAmount.push(totalTiers[key])
      }
    }

    const timeIntervalChunks = data!.filter((x, idx) => idx % 10 === 0).map((item: any) => {
      const bn = new BigNumber(item.delegationTotal)
      return {
        y: bn.dividedBy(10 ** 18),
        x: new Date(item.updated_at as string),
      }
    })

    const config = {
      type: "pie",
      data: {
        datasets: [{
          data: this.delegationArray,
          backgroundColor: ["#fbafaf", "#f3e8cb", "#f2c6b4", "#7bceee"],
          label: "Total Tiers",
        }],
        labels: tierKeys,
      },
      options: {
        responsive: true,
      },
    }

    const config2 = {
      type: "line",
      data: {
        datasets: [{
          data: timeIntervalChunks,
          backgroundColor: [
            "rgba(3, 169, 244, 0.5)",
          ],
          label: "Amount of LOOM staked",
        }],
      },
      options: {
        responsive: true,
        scales: {
          xAxes: [{
            type: "time",
          }],
          yAxes: [{
            type: "logarithmic",
          }],
        },
      },
      ticks: {
        autoSkip: true,
      },
    }
    // @ts-ignore
    const pieChart = new Chart(ctx, config)
    // @ts-ignore
    const barChart = new Chart(ctx2, config2)

  }

  randomScalingFactor() {
    return Math.round(Math.random() * 100)
  }

  getDaily() {
    const today = new Date().toISOString()
    const nowTime = new Date().toLocaleTimeString("it-IT")
    const fromDate = today.replace(today.substring(11), "00:00:00")
    const toDate = today.replace(today.substring(11), nowTime)
    return { fromDate, toDate }
  }

}
</script>

<style lang="scss" scoped>
  .period-select {
    margin-top: 0.5%;
    width: 50%;
    float: right;
  }
</style>
