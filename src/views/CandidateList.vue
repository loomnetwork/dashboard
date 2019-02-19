
<template>
  <div class="faucet">
    <div class="faucet-content">
      <div>
        <main>
          <div class="container mb-5 column py-3 p-3 d-flex" v-if="candidateList !== null">
            <h1>{{ $t('views.candidate_list.candidates') }}</h1>
            <faucet-table :items="candidateList" @row-clicked="showCandidateDetail"></faucet-table>
          </div>
          <div class="container mb-5 column py-3 p-3 d-flex" v-else>
            <h1>{{ $t('views.candidate_list.no_candidates') }}</h1>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import ApiClient from '../services/faucet-api'
import { Component, Watch } from 'vue-property-decorator'
import FaucetTable from '../components/FaucetTable'
import FaucetHeader from '../components/FaucetHeader'
import FaucetFooter from '../components/FaucetFooter'
import { getCandidatesAsync } from '../services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')

@Component({
  components: {
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
  },
  methods: {
    ...mapMutations([
      'setErrorMsg'
    ]),
  },
  computed: {
    ...DappChainStore.mapGetters([
      'currentChain',
      'currentRPCUrl',
    ])
  },
})
export default class CandidateList extends Vue {
  candidateList = [
    {
      Name: null,
      Status: null,
      "Stake": null,
      "Weight %": null,
      "Fees": null,
      "Uptime": null,
      "Slashes": null,
    }
  ]
  async mounted() {
    await this.refresh()
  }

  async refresh() {
    this.candidateList = [
      {
        Name: null,
        Status: null,
        "Stake": null,
        "Weight %": null,
        "Fees": null,
        "Uptime": null,
        "Slashes": null,
      }
    ]
    this.candidateList = await this.getCandidateList()
  }

  async getCandidateList() {
    try {
      const candidates = await getCandidatesAsync(this.currentRPCUrl)
      const candidateList = []
      for (let i = 0; i < candidates.length; i += 1) {
        candidateList.push({
          Name: "Candidate #" + (i + 1),
          Status: "Active",
          "Stake": candidates[i].power,
          "Weight %": "0%",
          "Fees": "0%",
          "Uptime": "0%",
          "Slashes": 0,
          _cellVariants: { Status: 'active'}
        })
      }
      if (candidateList.length === 0) {
        return null
      }
      return candidateList
    } catch (err) {
      this.setErrorMsg('Fetch Candidate List Failed')
      return null
    }
  }

  showCandidateDetail(record, index) {
    this.$router.push({
      name: 'candidateDetail',
      query: {
        id: index
      },
      // param: {
      //   candidate: this.candidateList[index]
      // }
    })
  }
}</script>

<style lang="scss">
@import url('https://use.typekit.net/nbq4wog.css');

$theme-colors: (
  //primary: #007bff,
  primary: #02819b,
  secondary: #4bc0c8,
  success: #5cb85c,
  info: #5bc0de,
  warning: #f0ad4e,
  danger: #d9534f,
  light: #f0f5fd,
  dark: #122a38
);

.faucet {
  main {
    margin-left: 0;
    min-height: 620px;
    .bottom-border {
      border-bottom: 2px solid lightgray;
    }
  }
  .faucet-content {
    .column {
      flex-direction: column;
    }
    h4, h1 {
      color: gray;
    }
  }
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
