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
          <b-form-input v-model="tokenName" type="text" placeholder="Token name" style="text-align: right;"></b-form-input>
          <b-input-group-append>
            <b-button @click="viewLogs">View Logs</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-card-header>
    </b-card>

    <div v-if="notFound" class="not-found"><h1 style="text-align:center;">Token not found ಠ_ಠ</h1></div>
    <div v-else>
      <b-table     
        striped 
        responsive
        sort-by.sync="id"
        :busy="isBusy" 
        :items="tokenMapData.txs" 
        :fields="tokenMappingFields"
        class="mapped-table">
          <div slot="table-busy" class="text-center my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </b-table>
      <b-pagination
        v-model="currentPage"
        :total-rows="tokenMapData.total"
        :per-page="tokenMapData.limit"
        @change="pageChange"
        align="center"
        class="mapped-pagination">
      </b-pagination>
    </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { formatTokenAmount } from "@/filters"
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb"
import { gatewayModule } from '@/store/gateway'
import { tokenService } from "@/services/TokenService"
import Axios from 'axios';

@Component({
  components: {
    
  },
})

export default class TransferGateway extends Vue {

  tokenMappingFields = [{ key: "id", label: "Id"},
  { key: "created_at", label: "Created At" },
  { key: "token_owner", label: "Token Owner"},
  { key: "token_kind", label: "Token Kind", formatter: value => { return this.getKeyByValue(TransferGatewayTokenKind, value) }},
  { key: "token_amount", label: "Token Amount", formatter: value => { return formatTokenAmount(value, 18, 0) }, tdClass: "align-right-td"},
  { key: "topic", label: "Topic"}
  ]

  viewerAddress: string = ""

  tokenMapData: any = null

  notFound: boolean = false
  isBusy: boolean = false

  tokenName = ""

  currentPage = 1

  getContractLogs = gatewayModule.getTokenContractLogs
  LOOMCOIN_ADDR = "0xA4E8C3eC456107ea67D3075bf9e3df3a75823Db0"

  get $state() { return (this.$store.state as DashboardState) }

  mounted() {
    // start with 'LOOMCOIN' token 
    // just for example ( will be delete later )
    this.viewerAddress = this.LOOMCOIN_ADDR
    this.getLogs(this.viewerAddress, 1)
  }

  async getLogs(address: string, page: number) {
    this.isBusy = true
    this.viewerAddress = address
    this.tokenMapData = await this.getContractLogs({contractAddress: this.viewerAddress, page: page})

    this.isBusy = false
    // when didnt get any record => display 'not found'
    this.tokenMapData.total === 0 ? this.notFound = true : this.notFound = false
  }

  viewLogs() {
    if (this.tokenName) {
      // this will be delete after
      if (this.tokenName.toUpperCase() == "LOOMCOIN") { 
        this.getLogs(this.LOOMCOIN_ADDR, 1)
      }
      //
      else {
        this.viewerAddress = tokenService.getTokenAddressBySymbol(this.tokenName.toUpperCase(), "plasma")
        this.getLogs(this.viewerAddress, 1)
      }
    } else {
      this.notFound = true
    }
  }

  pageChange(page) {
    this.currentPage = page
    this.getLogs(this.viewerAddress, page)
  }

  getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
  }

}
</script>

<style lang="scss">
  main.transfer-gateway {
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

  .mapped-pagination
  .mapped-table,
  .mapped-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  .not-found {
    margin-top: 26%;
    -webkit-user-select: none
  }

  .align-right-td {
    text-align: right;
    padding-right: 3%;
  }

  }
</style>
