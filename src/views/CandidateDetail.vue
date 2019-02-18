<template>
  <div class="faucet">
    <div class="faucet-content">
      <faucet-delegate-modal ref="delegateModalRef"></faucet-delegate-modal>
      <div>
        <main>
          <div class="container mb-2 column py-3 p-3 d-flex bottom-border">
            <h1>{{candidateInfo.Name}}</h1>
            <a href="www.candidate.com" target="_blank" class="text-gray"><u>www.candidate.com</u></a>
            <p class="text-gray mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean turpis nisl, suscipit eu orci id, fringilla ultricies eros.
              Donec et dui facilisis, suscipit tellus non, tempor sem. Phasellus lacinia sit amet velit at congue. Aliquam pretium tempus sem at faucibus. in eu Inctus velit, nec vehicula urna. In ac dui efficitur, volutpat nulla nec, rutrum nisi.</p>
          </div>
          <div class="container">
            <faucet-table :items="getCandidateDetail"></faucet-table>
            <div class="row d-flex justify-content-end px-4">
              <b-button class="px-5 py-2 mx-3" variant="primary" @click="openRequestDelegateModal" :disabled="!canDelegate">Delegate</b-button>
              <b-button class="px-5 py-2" variant="primary" @click="openRequestUnbondModal" :disabled="!canDelegate || !hasDelegation">Un-delegate</b-button>
            </div>
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
import FaucetDelegateModal from '../components/modals/FaucetDelegateModal'
import { getCandidatesAsync, checkDelegationAsync } from '../services/dposv2Utils.js'
import { mapGetters, mapState, mapActions, mapMutations, createNamespacedHelpers } from 'vuex'
const DappChainStore = createNamespacedHelpers('DappChain')

@Component({
  components: {
    FaucetTable,
    FaucetHeader,
    FaucetFooter,
    FaucetDelegateModal,
  },
  computed: {
    ...mapState([
      'userIsLoggedIn'
    ]),
    ...mapGetters([
      'getPrivateKey'
    ]),
    ...DappChainStore.mapGetters([
      'currentChain',
      'currentRPCUrl',
    ])
  },
  methods: {
    ...mapMutations([
      'setErrorMsg'
    ]),
  }
})
export default class CandidateDetail extends Vue {
  candidateInfo = {
    Name: "Candidate",
    Status: null,
    "Stake": null,
    "Weight %": null,
    "Fees": null,
    "Uptime": null,
    "Slashes": null,
  }

  candidate = null
  candidateList = null
  hasDelegation = false

  async mounted() {
    await this.refresh()
  }

  async refresh() {
    this.candidateList = await getCandidatesAsync(this.currentRPCUrl)
  }

  get canDelegate() {
    return this.userIsLoggedIn && this.getPrivateKey
  }

  get getCandidateDetail() {
    const index = parseInt(this.$route.query.id)

    const candidateForm = {
      Name: "Candidate",
      Status: null,
      "Stake": null,
      "Weight %": null,
      "Fees": null,
      "Uptime": null,
      "Slashes": null,
    }

    if (this.candidateList !== null && index >= this.candidateList.length) {
      // Candidate index is incorrect
      this.$router.push({
        name: 'candidates',
      })
      const candidateDetail = Object.assign({}, candidateForm)
      delete candidateDetail.Name
      return [candidateDetail]
    }
    if (this.candidateList === null) {
      // Still loading
      const candidateDetail = Object.assign({}, candidateForm)
      delete candidateDetail.Name
      return [candidateDetail]
    }
    this.candidate = this.candidateList[index]
    this.candidateInfo = {
      Name: "Candidate #" + (index + 1),
      Status: "Active",
      "Stake": this.candidate.power,
      "Weight %": "0%",
      "Fees": "0%",
      "Uptime": "0%",
      "Slashes": 0,
      _cellVariants: { Status: 'active'}
    }
    if (this.canDelegate) {
      checkDelegationAsync(this.currentRPCUrl, this.getPrivateKey, this.candidate)
      .then(res => {
        this.hasDelegation = true
      }).catch(err => {
        this.hasDelegation = false
        console.error(err)
      })
    }
    const candidateDetail = Object.assign({}, this.candidateInfo)
    delete candidateDetail.Name
    candidateDetail._cellVariants = { Status: 'active'}

    return [candidateDetail]
  }

  openRequestDelegateModal() {
    this.$refs.delegateModalRef.show(this.candidate.pubKey)//this.candidate.pub_key)
  }

  openRequestUnbondModal() {
    this.$refs.delegateModalRef.show(this.candidate.pubKey, 'unbond')
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
    .text-gray {
      color: gray;
    }
    .bottom-border {
      border-bottom: 2px solid lightgray;
    }
  }
}

</style>
<style>
body {
  overflow-y: scroll;
}
</style>
