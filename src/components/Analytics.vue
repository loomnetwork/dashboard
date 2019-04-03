<template>
  <div>
    <h2>
      Analytics
    </h2>
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

      let config = {
        type: 'pie',
        data: {
          datasets: [{
            data: [
              this.randomScalingFactor(),
              this.randomScalingFactor(),
              this.randomScalingFactor(),
              this.randomScalingFactor(),
              this.randomScalingFactor(),
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)'
            ],
            label: 'Dataset 1'
          }],
          labels: [
            'Red',
            'Orange',
            'Yellow',
            'Green',
            'Blue'
          ]
        },
        options: {
          responsive: true
        }
      }

      var pieChart = new Chart(ctx, config)
      
    }

		randomScalingFactor = () => {
			return Math.round(Math.random() * 100)
		}

  }
  
  </script>

<style lang="scss" scoped>
</style>
