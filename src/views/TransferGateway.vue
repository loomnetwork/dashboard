<template>
  <main class="transfer-gateway">
    <header>
      <h1>{{ $t('components.faucet_sidebar.transfer_gateway') }}</h1>
    </header>
    <div>
      <b-card>
        <b-row>
          <b-col class="card-label">
          <h5>{{ $t('views.transfer_gateway.connect_new_contracts') }}</h5>
          </b-col>
          <b-col>
          <b-button variant="primary" style="float:right;" :href="docsLink" target="_blank">{{ $t('views.transfer_gateway.view_docs') }}</b-button>
          </b-col>
        </b-row>
      </b-card>
      <b-card class="mapped-card">
        <b-row>
          <b-col class="card-label">
          <h5>{{ $t('views.transfer_gateway.debug_mapped_contract') }}</h5>
          </b-col>
          <b-col>
          <b-input-group
            v-on:keyup.enter="viewLogs">
            <b-form-input
              v-model="tokenName"
              type="text"
              :placeholder="$t('input_placeholder.token_name')"
              style="text-align: right;"
            ></b-form-input>
            <b-input-group-append>
              <b-button @click="viewLogs">{{ $t('views.transfer_gateway.view_logs') }}</b-button>
            </b-input-group-append>
          </b-input-group>
          </b-col>
        </b-row>
      </b-card>
      <b-card class="mapped-card-table">
      <mapped-token-address
        v-if="showResult.tokenAddress"
        :tokenData="tokenData"
        @toggleChain="switchChain"
        class="ml-4 mb-4"
      />
        <b-table
          v-if="showResult.table"
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
            <strong>{{ $t('views.transfer_gateway.loading') }}</strong>
          </div>
        </b-table>
        <b-pagination
          v-if="showResult.table"
          v-model="currentPage"
          :total-rows="tokenMapData.total"
          :per-page="tokenMapData.limit"
          @change="pageChange"
          align="center"
          class="mapped-pagination"
        ></b-pagination>
        <div v-if="showResult.notFound" class="not-found">
        <h1 style="text-align:center;">{{ showResult.message }}</h1>
      </div>
      </b-card>
      
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { DashboardState } from "@/types"
import { formatTokenAmount } from "@/filters"
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb"
import { gatewayModule } from "@/store/gateway"
import { tokenService, TokenData } from "@/services/TokenService"
import Axios from "axios"
import MappedTokenAddress from "@/components/MappedTokenAddress.vue"
import { feedbackModule } from "../feedback/store"

@Component({
  components: {
    MappedTokenAddress,
  },
})

export default class TransferGateway extends Vue {

  get $state() { return (this.$store.state as DashboardState) }

  tokenMappingFields: any[] = []

  tokenData: TokenData = {
    symbol: "",
    ethereum: "",
    plasma: "",
    binance: "",
    decimals: 0,
  }

  showResult = {
    tokenAddress: true,
    table: true,
    notFound: false,
    message: "",
  }

  tokenMapData: any = null
  isBusy: boolean = false

  tokenName = ""
  currentPage = 1

  onChain = "ethereum"

  docsLink = "https://loomx.io/developers/en/extdev-transfer-gateway.html#overview"

  getContractLogs = gatewayModule.getTokenContractLogs

  created() {
    this.tokenMappingFields = [{ key: "id", label: this.$t("views.transfer_gateway.fields.id") },
    { key: "created_at", label: this.$t("views.transfer_gateway.fields.created_at") },
    { key: "token_owner", label: this.$t("views.transfer_gateway.fields.token_owner") },
    {
      key: "token_kind",
      label: this.$t("views.transfer_gateway.fields.token_kind"),
      tdClass: "align-center-td",
      formatter: (value) => this.getKeyByValue(TransferGatewayTokenKind, value)  },
    {
      key: "token_amount",
      label: this.$t("views.transfer_gateway.fields.token_amount"),
      formatter: (value) => formatTokenAmount(value, 18, 0),
      tdClass: "align-right-td"  },
    { key: "topic", label: this.$t("views.transfer_gateway.fields.topic") },
    ]
  }

  mounted() {
    // start with "LOOM" token
    this.tokenData = tokenService.getTokenbySymbol("LOOM")
    this.checkChain(this.onChain)
  }

  async getLogs(address: string, page: number) {
    this.isBusy = true
    this.tokenMapData = await this.getContractLogs({ contractAddress: address, page })

    this.isBusy = false
    // when didnt get any record => display 'not found'
    if (this.tokenMapData.total === 0) {
      this.setShowResult("NO_EVENT")
    } else {
      this.setShowResult()
    }
  }

  viewLogs() {
    if (!this.tokenName) {
      return
    }
    try {
      this.tokenData = tokenService.getTokenbySymbol(this.tokenName.toUpperCase())
      this.checkChain(this.onChain)
      this.setShowResult()
    } catch (e) {
      this.tokenData.ethereum = ""
      this.tokenData.plasma = ""
      this.setShowResult("NO_TOKEN")
    }
    this.tokenData.symbol = this.tokenName.toUpperCase()
  }

  pageChange(page) {
    this.currentPage = page
    this.checkChain(this.onChain)
  }

  getKeyByValue(obj, value) {
    return Object.keys(obj).find((key) => obj[key] === value)
  }

  checkChain(chain) {
    // if user click binance chain, use plasma address (just for now)
    if (this.onChain  === "ethereum") {
      this.getLogs(this.tokenData.ethereum, 1)
    } else if (this.onChain  === "binance") {
      this.getLogs(this.tokenData.plasma, 1)
    }
  }

  switchChain(value) {
    this.onChain = value
    this.checkChain(value)
  }

  setShowResult(msg?: string) {
    if (msg) {
      this.showResult.table = false
      this.showResult.notFound = true
      if (msg === "NO_EVENT") {
        this.showResult.tokenAddress = true
        this.showResult.message = this.$t("messages.no_event_found").toString()
      } else if (msg === "NO_TOKEN") {
        this.showResult.tokenAddress = false
        this.showResult.message = this.$t("messages.no_token_found", {tokenName: this.tokenName }).toString()
      }
    } else {
      this.showResult.table = true
      this.showResult.tokenAddress = true
      this.showResult.notFound = false
    }
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

  .mapped-pagination, .mapped-table,
  .mapped-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  .not-found {
    margin: 10% 0;
    user-select: none;
    -webkit-user-select: none;
  }

  .align-right-td {
    text-align: right;
    padding-right: 1.5%;
  }

  .align-center-td {
    text-align: center;
  }

  .card-label {
    margin-top: 0.5%;
    margin-left: 2%;
  }

  .mapped-table {
    font-size: 14px;
  }

  .mapped-card-table {
    .card-body {
      padding: 1.25rem 0 1.25rem 0;
    }
  }
}
</style>
