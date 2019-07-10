<template>
  <main class="transfer-gateway">
    <header>
      <h1>Transfer Gateway</h1>
    </header>
    <div>
    <b-card>
      <b-card-header class="connect-new-contract d-flex justify-content-between">
        <h5>Connect New Contracts</h5>
        <b-button variant="primary" style="float:right;">View Documentations</b-button>
      </b-card-header>     
    </b-card>
    <b-card class="mapped-card">
      <b-card-header class="debug-mapped-contract d-flex justify-content-between">
        <h5 class="col-5">Debug Mapped Contract</h5>
        <b-input-group>
          <b-form-input type="text" placeholder="Token name" style="text-align: right;"></b-form-input>
          <b-input-group-append>
            <b-button>View Logs</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-card-header>
    </b-card>
    <b-table responsive :items="tokenMapLog" :fields="tokenMappingFields" class="mapped-table"></b-table>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { PlasmaState, PlasmaTokenKind } from "@/store/plasma/types"
import { formatTokenAmount } from "@/filters"
import Axios from 'axios';

@Component({
  components: {
    
  },
})

export default class TransferGateway extends Vue {

  tokenMappingFields = [{ key: "id", label: "Id" },
  { key: "createdAt", label: "Created At" },
  { key: "tokenOwner", label: "Token Owner"},
  { key: "tokenKind", label: "Token Kind"},
  { key: "tokenAmount", label: "Token Amount", formatter: value => { return formatTokenAmount(value, 18, 0) }},
  { key: "topic", label: "Topic"}
  ]

  jimboAddr = "eth:0xd54549ECa78920EBb72f560b4979cf803C6C41a3"

  tokenMapLog: any[] | null = []

  get $state() { return (this.$store.state as DashboardState) }

  get historyUrl() {
    return this.$state.plasma.historyUrl
  }

  get tokenMap() {
    console.log("TOKEN!!", this.tokenHistory())
    return tokenHistory() 
  }

  async mounted() {
    const indexerUrl = this.historyUrl.replace("{address}", this.jimboAddr)
    let response = await Axios.get(indexerUrl).then((response) => {
      return response.data.txs.filter((item) => /^event\:Mainnet/.test(item.topic))
      .map((item) => {
        this.tokenMapLog.push({
          id: item.id,
          createdAt: item.created_at,
          tokenOwner: item.token_owner,
          tokenKind: item.token_kind,
          tokenAmount: item.token_amount,
          topic: item.topic,
        })
      })
    })
  }

}
</script>

<style lang="scss" scoped>
  main.transfer-gateway {
  // ther should be global class for page titles
  header > h1 {
    color: #5246d5;
    font-size: 1.35em;
    text-align: center;
    margin: 16px -14px;
    font-weight: normal;
    border-bottom: 1px solid #ededed;
    padding-bottom: 16px;
  }

  .connect-new-contract,
  .debug-mapped-contract {
    padding-bottom: 0px;
    border: none;
    background-color: #ffffff;
  }

  .mapped-table,
  .mapped-card {
    margin-top: 2%;
  }

  .mapped-table {
    position: absolute;
    left: 0;
    right: 0;
  }

  }
</style>
