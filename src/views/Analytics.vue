<template>
  <div class="container">
    <div class="row px-3 py-4">
      <div class="col-md-6 mb-4">
        <b-card :title="$t('views.analytics.total_amount_staked')">
          <canvas id="barChart" width="300" height="300"></canvas>
        </b-card>
      </div>
      <div class="col-md-6 mb-4">
        <b-card :title="$t('views.analytics.tier_distribution')">
          <canvas id="pieChart" width="300" height="300"></canvas>
        </b-card>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import Vue from "vue"
import Chart from "chart.js"
import { Component } from "vue-property-decorator"

import { DashboardState } from "../types"
import { timer } from "rxjs"
import { dposModule } from "../dpos/store"
import BigNumber from "bignumber.js"

@Component
export default class Analytics extends Vue {

  get state(): DashboardState {
    return this.$store.state
  }

  async beforeMount() {
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
          data: tierAmount,
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
          ],
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
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
            "rgba(3, 169, 244, 0.5)",
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
        },
      },
    }

    const pieChart = new Chart(ctx, config)
    const barChart = new Chart(ctx2, config2)

  }

  randomScalingFactor() {
    return Math.round(Math.random() * 100)
  }

}
</script>

<style lang="scss" scoped>
</style>
