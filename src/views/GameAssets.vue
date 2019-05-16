<template>
    <div class="container">
        GAME
        <b-card>
          My Account
          <b-row>
            <b-col>Ethereum:</b-col>
            <b-col><b-form-input v-model="ethAccount"></b-form-input></b-col>
            <router-link to="gotoEtherScan">Show in EtherScan </router-link>
          </b-row>
          <b-row>
            <b-col>Loom:</b-col>
            <b-col><b-form-input v-model="dappchainAccount"></b-form-input></b-col>
            <router-link to="gotoBlockExplorer">Show in Block Explorer</router-link>
          </b-row>
        </b-card>

        <b-card no-body>
          <b-card-title>My Game Assets</b-card-title>
          <b-tabs card>
            <b-tab title="Standard-Edition">
              <b-card-text> standard-edition amount: {{ standardEditionAmount }} </b-card-text>
              <b-table
                v-show="standardEditionAmount > 0"
                striped
                bordered
                hover
                :items="seCards"
                :fields="cardTableFields"
              >
                <template slot="reciever" slot-scope="row">
                  <b-input
                    type="text"
                    v-model="row.item.reciever"
                    class="d-block"
                    placeholder="dappchain address"
                  />
                </template>
                <template slot="packAmountTransfer" slot-scope="row">
                  <b-input
                    type="number"
                    v-model="row.item.packAmountTransfer"
                    class="d-block"
                    placeholder="amount"
                  />
                </template>
                <template slot="transfer" slot-scope="row">
                  <b-button type="button" @click="transferpackTo(row.item)"> Transfer </b-button>
                </template>
              </b-table>
            </b-tab>
            <b-tab title="Backer-Edition">
              <b-card-text> backer-edition amount: {{ backerEditionAmount }} </b-card-text>
              <b-table
                v-show="backerEditionAmount > 0"
                striped
                bordered
                hover
                :items="beCards"
                :fields="cardTableFields"
              >
              </b-table>
            </b-tab>
            <b-tab title="Limited-Edition">
              <b-card-text> limited-edition amount: {{ limitedEditionAmount }} </b-card-text>
              <b-table
                v-show="limitedEditionAmount > 0"
                striped
                bordered
                hover
                :items="leCards"
                :fields="cardTableFields"
              >
              </b-table>
            </b-tab>
            <b-tab title="Binance-Edition">
              <b-card-text> binance-edition amount: {{ binanceEditionAmount }} </b-card-text>
              <b-table
                v-show="binanceEditionAmount > 0"
                striped
                bordered
                hover
                :items="bneCards"
                :fields="cardTableFields"
              >
              </b-table>
            </b-tab>
            <b-tab title="Tron-Edition">
              <b-card-text> tron-edition amount: {{ tronEditionAmount }} </b-card-text>
              <b-table
                v-show="tronEditionAmount > 0"
                striped
                bordered
                hover
                :items="teCards"
                :fields="cardTableFields"
              >
              </b-table>
            </b-tab>
            <b-tab title="Summary">
              <b-row class="mb-2">
                <b-col>
                  <b-card-text> standard-edition amount: {{ standardEditionAmount }} </b-card-text>
                </b-col>
                <b-col>
                  <b-card-text> backer-edition amount: {{ backerEditionAmount }} </b-card-text>
                </b-col>
                <b-col>
                  <b-card-text> limited-edition amount: {{ limitedEditionAmount }} </b-card-text>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col>
                  <b-card-text> binance-edition amount: {{ binanceEditionAmount }} </b-card-text>
                </b-col>
                <b-col>
                  <b-card-text> tron-edition amount: {{ tronEditionAmount }} </b-card-text>
                </b-col>
                <b-col> </b-col>
              </b-row>
              <b-table striped bordered hover :items="cards" :fields="cardTableFields">
              </b-table>
            </b-tab>
          </b-tabs>
        </b-card>

    </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { plasmaModule } from "../store/plasma"
import { CardDetail } from "../store/plasma/types"
import { dposModule } from '../store/dpos';
import { dposStorePlugin } from '../store/dposPlugin';

@Component({
})

export default class GameAssets extends Vue {
  cardBalance = plasmaModule.state.cardBalance
  checkCardBalance = plasmaModule.checkCardBalance
  ethAccount = "0x5237652768382879213973297821"
  dappchainAccount = "0x9824832894320123911231"
  etherScanDomain = "https://etherscan.io" // TODO: set to env variable
  blockExplorerDomain = "https://blockexplorer.loomx.io/" // TODO: set to env variable
  cards: CardDetail[] = []
  seCards: CardDetail[] = []
  leCards: CardDetail[] = []
  beCards: CardDetail[] = []
  bneCards: CardDetail[] = []
  teCards: CardDetail[] = []
  userCardsAmount: number = 0
  standardEditionAmount: number = 0
  limitedEditionAmount: number = 0
  backerEditionAmount: number = 0
  binanceEditionAmount: number = 0
  tronEditionAmount: number = 0
  // amountTransfer: number = 0
  // receiverAddress: string = ""
  // cardIdTransfer: string = ""
  cardTableFields = [
    {
      key: "id",
      sortable: true
    },
    {
      key: "display_name",
      sortable: true
    },
    {
      key: "variation",
      sortable: true
    },
    {
      key: "amount",
      sortable: true
    },
    {
      key: 'packAmountTransfer',
      label: 'Amount to transfer'
    },
    { key: "reciever", label: "Reciever" },
    { key: "transfer", label: "Transfer" },
  ]

  async mounted() {
    await this.checkCardBalance()
    this.cards = await this.cardBalance
    console.log(this.cards)
  }

  gotoEtherScan() {
    return `${this.etherScanDomain}/address/${this.ethAccount}`
  }

  gotoBlockExplorer() {
    return `${this.blockExplorerDomain}` // TODO: goto specific address
  }

  resetCardAmount() {
    console.log("reset....");
    this.userCardsAmount = 0,
    this.standardEditionAmount = 0,
    this.limitedEditionAmount = 0,
    this.backerEditionAmount = 0,
    this.binanceEditionAmount = 0,
    this.tronEditionAmount = 0
    this.seCards = [],
    this.leCards = [],
    this.beCards = [],
    this.bneCards = [],
    this.teCards = [],
    this.cards = []

  }

  @Watch("cardBalance")
  async onUserCardChanged(newUserCards: CardDetail[], oldUserCards: CardDetail[]) {
    console.log("new", newUserCards.length);
    console.log("old", oldUserCards.length);
    
    this.resetCardAmount()
    if (newUserCards.length > 0) {
      this.cards = newUserCards
      this.cards.forEach(cd => {
        if (cd.id.endsWith("0")) {
          this.standardEditionAmount += cd.amount
          this.seCards.push(cd)
        } else if (cd.id.endsWith("1")) {
          this.backerEditionAmount += cd.amount
          this.beCards.push(cd)
        } else if (cd.id.endsWith("2")) {
          this.limitedEditionAmount += cd.amount
          this.leCards.push(cd)
        } else if (cd.id.endsWith("3")) {
          this.binanceEditionAmount += cd.amount
          this.bneCards.push(cd)
        } else if (cd.id.endsWith("4")) {
          this.tronEditionAmount += cd.amount
          this.teCards.push(cd)
        } else {
          console.log("wrong card id", cd)
        }
        this.userCardsAmount += cd.amount
      })
    }
  }
}
</script>

