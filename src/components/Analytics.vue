<template>
  <div>
    <canvas id="pieChart" width="300" height="300"></canvas>
  </div>
</template>


<script>
  import Vue from 'vue'
  import Chart from 'chart.js'
  import { Component } from 'vue-property-decorator'
  import FaucetTable from '../components/FaucetTable'
  import { mapGetters, mapState, mapActions, mapMutatioins, createNamespacedHelpers } from 'vuex'

  import ApiClient from '../services/api'
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
            label: 'Total Tiers'
          }],
          labels: tierKeys
        },
        options: {
          responsive: true
        }
      }

      const pieChart = new Chart(ctx, config)
      
    }

		randomScalingFactor = () => {
			return Math.round(Math.random() * 100)
		}

  }
  
  </script>

<style lang="scss" scoped>
</style>
