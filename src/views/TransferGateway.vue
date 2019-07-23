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
            <b-form-input
              v-model="tokenName"
              type="text"
              placeholder="Token name"
              style="text-align: right;"
            ></b-form-input>
            <b-input-group-append>
              <b-button @click="viewLogs">View Logs</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-card-header>
      </b-card>
      <mapped-token-address
        :token="showTokenName"
        :ethAddress="ethContractAddress"
        :plasmaAddress="viewerAddress"
        class="mt-5 mb-4"
      />

      <div v-if="notFound" class="not-found">
        <h1 style="text-align:center;">{{ notFoundMsg }}</h1>
      </div>
      <div v-else>
        <b-table
          striped
          responsive
          sort-by.sync="id"
          :busy="isBusy"
          :items="tokenMapData.txs"
          :fields="tokenMappingFields"
          class="mapped-table"
        >
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
          class="mapped-pagination"
        ></b-pagination>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { formatTokenAmount } from "@/filters"
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb"
import { gatewayModule } from "@/store/gateway"
import { tokenService } from "@/services/TokenService"
import Axios from "axios"
import MappedTokenAddress from "@/components/MappedTokenAddress.vue"
import { feedbackModule } from "../feedback/store"

@Component({
  components: {
    MappedTokenAddress,
  },
})

export default class TransferGateway extends Vue {

  tokenMappingFields = [{ key: "id", label: "Id" },
  { key: "created_at", label: "Created At" },
  { key: "token_owner", label: "Token Owner" },
  {
    key: "token_kind",
    label: "Token Kind",
    formatter: (value) => this.getKeyByValue(TransferGatewayTokenKind, value)  },
  {
    key: "token_amount",
    label: "Token Amount",
    formatter: (value) => formatTokenAmount(value, 18, 0),
    tdClass: "align-right-td"  },
  { key: "topic", label: "Topic" },
  ]

  viewerAddress: string = ""
  ethContractAddress: string = ""

  tokenMapData: any = null

  notFound: boolean = false
  notFoundMsg: string = ""
  isBusy: boolean = false

  tokenName = ""
  showTokenName = ""

  currentPage = 1

  LOOM_TOKEN = ["LOOMCOIN", "LOOM"]
  getContractLogs = gatewayModule.getTokenContractLogs
  LOOMCOIN_ADDR = "0xA4E8C3eC456107ea67D3075bf9e3df3a75823Db0"

  get $state() { return (this.$store.state as DashboardState) }

  mounted() {
    // start with 'LOOMCOIN' token
    // just for example ( will be delete later )
    this.viewerAddress = this.LOOMCOIN_ADDR
    this.showTokenName = "LOOM"
    this.getLogs(this.viewerAddress, 1)
  }

  async getLogs(address: string, page: number) {
    this.isBusy = true
    this.tokenMapData = await this.getContractLogs({ contractAddress: this.viewerAddress, page })

    this.isBusy = false
    // when didnt get any record => display 'not found'
    if (this.tokenMapData.total === 0) {
      this.notFound = true
      this.notFoundMsg = "No event found on this token"
    } else {
      this.notFound = false
    }
  }

  viewLogs() {
    // this will be delete after
    if (this.LOOM_TOKEN.includes(this.tokenName.toUpperCase())) {
      this.viewerAddress = this.LOOMCOIN_ADDR
      this.ethContractAddress = ""
      this.getLogs(this.LOOMCOIN_ADDR, 1)
    } else {
      try {
        this.viewerAddress = tokenService.getTokenAddressBySymbol(this.tokenName.toUpperCase(), "plasma")
        this.ethContractAddress = tokenService.getTokenAddressBySymbol(this.tokenName.toUpperCase(), "ethereum")
        this.getLogs(this.ethContractAddress, 1)
      } catch (e) {
        this.viewerAddress = ""
        this.ethContractAddress = ""
        this.notFound = true
        this.notFoundMsg = `Token ${this.tokenName} not found`
      }
    }
    this.showTokenName = this.tokenName
  }

  pageChange(page) {
    this.currentPage = page
    this.getLogs(this.viewerAddress, page)
  }

  getKeyByValue(obj, value) {
    return Object.keys(obj).find((key) => obj[key] === value)
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

  .mapped-pagination .mapped-table,
  .mapped-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  .not-found {
    margin-top: 26%;
    -webkit-user-select: none;
  }

  .align-right-td {
    text-align: right;
    padding-right: 3%;
  }
}
</style>
