<template>
  <div>
    <h5>Validator Engagement</h5>
    <VueApexCharts height="350" type="radialBar" :options="radialOptions" :series="[89]" />
    <h6>Contributing Factors</h6>
    <VueApexCharts height="70" type="bar" :options="barOptions('New Delegation')" :series="[{ data: [40] }]" />
    <VueApexCharts height="70" type="bar" :options="barOptions('Articles/Content Engagement')" :series="[{ data: [20] }]" />
    <VueApexCharts height="70" type="bar" :options="barOptions('% Delegators in Voting Pool')" :series="[{ data: [80] }]" />
    <VueApexCharts height="70" type="bar" :options="barOptions('Bounties Completed')" :series="[{ data: [40] }]" />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"
import ApexCharts from "apexcharts"
import VueApexCharts from "vue-apexcharts"

@Component({
  components: {
    VueApexCharts,
  },
})
export default class ValidatorStats extends Vue {
  radialOptions = {
    plotOptions: {
      radialBar: {
        startAngle: -100,
        endAngle: 100,
        dataLabels: {
          name: {
            offsetY: 20,
            fontSize: "12px",
            color: "#AAA",
          },
          value: {
            offsetY: -20,
            fontSize: "48px",
            color: "#1D293C",
            formatter: (val) => val,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "horizontal",
        colorStops: [
          {
            offset: 0,
            color: "#CF8BF3",
            opacity: 1,
          },
          {
            offset: 20,
            color: "#87D4F9",
            opacity: 1,
          },
          {
            offset: 100,
            color: "#00F260",
            opacity: 1,
          },
        ],
      },
    },
    stroke: {
      dashArray: 5,
    },
    labels: ["Out of 100"],
    states: {
      hover: {
        filter: undefined,
      },
      active: {
        filter: undefined,
      },
    },
  }

  barOptions(title: string) {
    return {
      chart: {
        stacked: true,
        sparkline: {
          enabled: true,
        },
      },
      colors: ["#5372B3"],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "20%",
          colors: {
            backgroundBarColors: ["#BBB"],
          },
        },
      },
      title: {
        floating: true,
        offsetX: -10,
        offsetY: 5,
        text: title,
        style: {
          color: "#999",
        },
      },
      tooltip: {
        enabled: false,
      },
      yaxis: {
        max: 100,
      },
      states: {
        hover: {
          filter: undefined,
        },
        active: {
          filter: undefined,
        },
      },
    }
  }
}
</script>
