<template>
  <b-card class="mb-5">
    <transfer-cards-modal ref="transferModalConfig"></transfer-cards-modal>
    <transfer-all-cards-modal ref="transferAllCardsModalConfig"></transfer-all-cards-modal>
    <b-card-title>My Cards</b-card-title>
    <b-tabs card>
      <b-tab title="Standard-Edition">
        <b-row class="mb-2">
          <b-col>
            <b-card-text>standard-edition amount: {{ standardEditionAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-row>
              <b-card-text>Transfer all Standard edition cards</b-card-text>
              <b-button
                class="ml-2"
                type="button"
                @click="openBatchTransferCardsModal('Standard', seCards, standardEditionAmount)"
              >Transfer All</b-button>
            </b-row>
          </b-col>
        </b-row>
        <b-table
          v-show="standardEditionAmount > 0"
          striped
          bordered
          hover
          :items="seCards"
          :fields="cardTableFields"
        >
          <template slot="transfer" slot-scope="row">
            <b-button type="button" @click="openTransferCardsModal(row.item)">Transfer</b-button>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Backer-Edition">
        <b-row class="mb-2">
          <b-col>
            <b-card-text>backer-edition amount: {{ backerEditionAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-row>
              <b-card-text>Transfer all Backer edition cards</b-card-text>
              <b-button
                class="ml-2"
                type="button"
                @click="openBatchTransferCardsModal('Backer', beCards, backerEditionAmount)"
              >Transfer All</b-button>
            </b-row>
          </b-col>
        </b-row>
        <b-table
          v-show="backerEditionAmount > 0"
          striped
          bordered
          hover
          :items="beCards"
          :fields="cardTableFields"
        >
          <template slot="transfer" slot-scope="row">
            <b-button type="button" @click="openTransferCardsModal(row.item)">Transfer</b-button>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Limited-Edition">
        <b-row class="mb-2">
          <b-col>
            <b-card-text>limited-edition amount: {{ limitedEditionAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-row>
              <b-card-text>Transfer all Limited edition cards</b-card-text>
              <b-button
                class="ml-2"
                type="button"
                @click="openBatchTransferCardsModal('Limited', leCards, limitedEditionAmount)"
              >Transfer All</b-button>
            </b-row>
          </b-col>
        </b-row>
        <b-table
          v-show="limitedEditionAmount > 0"
          striped
          bordered
          hover
          :items="leCards"
          :fields="cardTableFields"
        >
          <template slot="transfer" slot-scope="row">
            <b-button type="button" @click="openTransferCardsModal(row.item)">Transfer</b-button>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Binance-Edition">
        <b-row class="mb-2">
          <b-col>
            <b-card-text>binance-edition amount: {{ binanceEditionAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-row>
              <b-card-text>Transfer all Binance edition cards</b-card-text>
              <b-button
                class="ml-2"
                type="button"
                @click="openBatchTransferCardsModal('Binance', bneCards, binanceEditionAmount)"
              >Transfer All</b-button>
            </b-row>
          </b-col>
        </b-row>
        <b-table
          v-show="binanceEditionAmount > 0"
          striped
          bordered
          hover
          :items="bneCards"
          :fields="cardTableFields"
        >
          <template slot="transfer" slot-scope="row">
            <b-button type="button" @click="openTransferCardsModal(row.item)">Transfer</b-button>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Tron-Edition">
        <b-row class="mb-2">
          <b-col>
            <b-card-text>tron-edition amount: {{ tronEditionAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-row>
              <b-card-text>Transfer all Tron edition cards</b-card-text>
              <b-button
                class="ml-2"
                type="button"
                @click="openBatchTransferCardsModal('Tron', teCards, tronEditionAmount)"
              >Transfer All</b-button>
            </b-row>
          </b-col>
        </b-row>
        <b-table
          v-show="tronEditionAmount > 0"
          striped
          bordered
          hover
          :items="teCards"
          :fields="cardTableFields"
        >
          <template slot="transfer" slot-scope="row">
            <b-button type="button" @click="openTransferCardsModal(row.item)">Transfer</b-button>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Summary">
        <b-row class="mb-2">
          <b-col>
            <b-card-text>standard-edition amount: {{ standardEditionAmount }}</b-card-text>
            <b-card-text>backer-edition amount: {{ backerEditionAmount }}</b-card-text>
            <b-card-text>limited-edition amount: {{ limitedEditionAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-card-text>binance-edition amount: {{ binanceEditionAmount }}</b-card-text>
            <b-card-text>tron-edition amount: {{ tronEditionAmount }}</b-card-text>
            <b-card-text class="font-weight-bold">total amount: {{ userCardsAmount }}</b-card-text>
          </b-col>
          <b-col>
            <b-card-text>Transfer all cards</b-card-text>
            <b-button
              type="button"
              @click="openBatchTransferCardsModal('All', cards, userCardsAmount)"
            >Transfer All</b-button>
          </b-col>
        </b-row>
        <b-table striped bordered hover :items="cards" :fields="cardTableFields">
          <template slot="transfer" slot-scope="row">
            <b-button type="button" @click="openTransferCardsModal(row.item)">Transfer</b-button>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { plasmaModule } from "@/store/plasma"
import { CardDetail } from "@/store/plasma/types"
import { DashboardState } from "@/types"
import TransferAllCardsModal from "@/components/modals/TransferAllCardsModal.vue"
import TransferCardsModal from "@/components/modals/TransferCardsModal.vue"
import { Modal } from "bootstrap-vue"
import { assetsModule } from "../../store/plasma/assets"

@Component({
  components: {
    TransferCardsModal,
    TransferAllCardsModal,
  },
})
export default class Cards extends Vue {
  checkCardBalance = assetsModule.checkCardBalance
  setCardToTransferSelected = assetsModule.setCardToTransferSelected
  setAllCardsToTransferSelected = assetsModule.setAllCardsToTransferSelected
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
  cardTableFields = [
    {
      key: "id",
      sortable: true,
    },
    {
      key: "display_name",
      sortable: true,
    },
    {
      key: "variation",
      sortable: true,
    },
    {
      key: "amount",
      sortable: true,
    },
    {
      key: "transfer",
      label: "Transfer",
    },
  ]

  get state(): DashboardState {
    return this.$store.state
  }

  get cardBalance() {
    return this.state.assets.cardBalance
  }

  async mounted() {
    await this.checkCardBalance()
    this.cards = await this.cardBalance
  }

  modal(ref: string) {
    return this.$refs[ref] as Modal
  }

  openTransferCardsModal(item) {
    this.setCardToTransferSelected(item)
    this.$root.$emit("bv::show::modal", "transfer-cards-modal")
  }

  openBatchTransferCardsModal(edition, cards, amount) {
    this.setAllCardsToTransferSelected({ edition, cards, amount })
    this.$root.$emit("bv::show::modal", "transfer-all-cards-modal")
  }

  resetCardAmount() {
    (this.userCardsAmount = 0),
      (this.standardEditionAmount = 0),
      (this.limitedEditionAmount = 0),
      (this.backerEditionAmount = 0),
      (this.binanceEditionAmount = 0),
      (this.tronEditionAmount = 0);
    (this.seCards = []),
      (this.leCards = []),
      (this.beCards = []),
      (this.bneCards = []),
      (this.teCards = []),
      (this.cards = [])
  }

  @Watch("cardBalance")
  async onUserCardChanged(
    newUserCards: CardDetail[],
    oldUserCards: CardDetail[],
  ) {
    this.resetCardAmount()
    if (newUserCards.length > 0) {
      this.cards = newUserCards
      this.cards.forEach((cd) => {
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
          console.error("wrong card id " + cd)
        }
        this.userCardsAmount += cd.amount
      })
    }
  }
}
</script>

