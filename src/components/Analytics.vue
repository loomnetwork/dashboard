<template>
  <div>
    <canvas id="barChart" width="300" height="300"></canvas>
    <canvas id="pieChart" width="300" height="300"></canvas>
  </div>
</template>


<script>
  import Vue from 'vue'
  import Chart from 'chart.js'
  import { Component } from 'vue-property-decorator'
  import FaucetTable from '../components/FaucetTable'
  import { mapGetters, mapState, mapActions, mapMutatioins, createNamespacedHelpers } from 'vuex'

  import { formatToCrypto } from '@/utils'
  import { isIP } from 'net'

  const DappChainStore = createNamespacedHelpers('DappChain')
  const DPOSStore = createNamespacedHelpers('DPOS')

  @Component({
    components: {
    },
    computed: {
      ...DPOSStore.mapState([
        "analyticsData",
      ])
    },
    methods: {
      ...DPOSStore.mapActions([
        "fetchAnalyticsData"
      ])
    }
  })
  export default class Analytics extends Vue {
    async mounted() {
      await this.fetchAnalyticsData()
      const ctx = document.getElementById("pieChart")
      const ctx2 = document.getElementById("barChart")


      let totalTiers = this.analyticsData.data.data[0].tiers 
      let tierAmount = []
      let tiers = {"zero": "2 weeks", "one": "3 months", "two": "6 months", "three": "1 year"}
      let tierKeys = []
      for (var key in totalTiers) {
        tierKeys.push(tiers[key])
        if(totalTiers.hasOwnProperty(key)) {
          tierAmount.push(totalTiers[key])
        }
      }

      let timeIntervalChunks = this.analyticsData.data.data.filter((x, idx) => idx % 10 === 0).map((item) => {
        let int = parseInt(item.delegationTotal)
        return (int / 10 ** 18)
      })

      let config = {
        type: 'pie',
        data: {
          datasets: [{
            data: tierAmount,
            backgroundColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            label: "Total Tiers"
          }],
          labels: tierKeys
        },
        options: {
          responsive: true
        }
      }

      let config2 = {
        type: 'bar',
        data: {
          datasets: [{
            data: timeIntervalChunks,
            label: "Amount of LOOM staked"
          }],
          labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        },
        options: {
          responsive: true
        }
      }

      const pieChart = new Chart(ctx, config)
      const barChart = new Chart(ctx2, config2)
      
    }

		randomScalingFactor = () => {
			return Math.round(Math.random() * 100)
		}

  }
  
  </script>

<style lang="scss" scoped>
</style>
