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
        <b-input placeholder="Token name" style="text-align: right;" class="col-4"></b-input>
        <b-button style="float:right;" class="col-2">View Logs</b-button>
      </b-card-header>
    </b-card>
    <b-table responsive :items="items" :fields="fields" class="mapped-table"></b-table>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"

@Component({
  components: {
  },
})

export default class TransferGateway extends Vue {
  fields = ['id', 'created_at', 'token_owner', 'token_kind', 'token_amount', 'topic', 'error_message']
  items = [
    { id: '4681', created_at: '2019-04-24T05:23:39Z', token_owner:"eth:0x91A31A1C5197DD101e91B0747B02560f41E2f532", token_kind:"LOOMCOIN", token_amount:"875", topic:"event:MainnetDepositEvent" },
    { id: '4701', created_at: '2019-04-24T05:23:39Z', token_owner:"eth:0x91A31A1C5197DD101e91B0747B02560f41E2f532", token_kind:"LOOMCOIN", token_amount:"150", topic:"event:MainnetDepositEvent" },
  ]
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


