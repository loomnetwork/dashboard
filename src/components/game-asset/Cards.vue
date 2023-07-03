<template>
  <b-card class="cards-view" no-body>
    <transfer-cards-modal ref="transferModalConfig"></transfer-cards-modal>
    <transfer-all-cards-modal ref="transferAllCardsModalConfig"></transfer-all-cards-modal>
    <b-card-header>
      <h4 class="card-title">{{ $t('components.gameAsset.cards.my_cards') }}</h4>
      <b-dropdown :text="editionFilterText" variant="outline-info">
        <b-dropdown-item-button @click="edition = null">{{ $t('components.gameAsset.cards.all_edition') }}</b-dropdown-item-button>
        <b-dropdown-item-button
          v-for="option in editions"
          :key="option.name"
          @click="edition = option"
        >{{option.name}} {{ $t('components.gameAsset.cards.edition') }} ({{option.amount}})</b-dropdown-item-button>
      </b-dropdown>
    </b-card-header>
    <b-card-body v-if="filteredCards.length > 7 || inputFilter !== ''">
      <b-form-input v-model="inputFilter" :placeholder="$t('input_placeholder.filter')"></b-form-input>
    </b-card-body>
    <b-card-body v-if="filteredCards.length === 0">{{ $t('components.gameAsset.cards.no_card') }}</b-card-body>
    <b-list-group flush>
      <b-list-group-item v-for="card in filteredCards" :key="card.id">
        <label class="name">#{{card.id}} - {{card.display_name}}</label>
        <span class="balance">
          x {{card.amount}}
          <small>{{ $t('components.gameAsset.cards.amount') }}</small>
        </span>
        <b-button-group class="actions">
          <b-button
            class="button"
            size="sm"
            variant="outline-primary"
            @click="openTransferCardsModal(card)"
          >{{ $t('components.gameAsset.cards.transfer') }}</b-button>
        </b-button-group>
      </b-list-group-item>
    </b-list-group>
    <b-card-footer>
      <b-button
        type="button"
        variant="outline-danger"
        @click="openBatchTransferCardsModal"
      >{{ $t('components.gameAsset.cards.transfer_all') }} {{editionFilterText}}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"
import { CardDetail } from "@/store/plasma/types"
import { DashboardState } from "@/types"
import TransferAllCardsModal from "@/components/modals/TransferAllCardsModal.vue"
import TransferCardsModal from "@/components/modals/TransferCardsModal.vue"
import { BModal } from "bootstrap-vue"
import { assetsModule } from "../../store/plasma/assets"

interface Edition {
  name: string,
  cards: CardDetail[],
  amount: number
}

@Component({
  components: {
    TransferCardsModal,
    TransferAllCardsModal,
  },
})
export default class Cards extends Vue {
  editionNames = ["Standard", "Limited", "Backer", "Binance", "Tron"]
  editions: Edition[] = []
  edition: Edition | null = null
  inputFilter: string = ""

  get editionFilterText() {
    console.log(this.edition)
    return this.edition ?
      `${this.edition.name} ${this.$t("components.gameAsset.cards.edition")} (${this.edition.amount})` :
      `${this.$t("components.gameAsset.cards.all_edition")} (${this.userCardsAmount})`
  }

  get filteredCards() {
    const cards = this.edition === null ? this.cards : this.edition.cards
    const filter = this.inputFilter.toLowerCase()
    return cards.filter((cd) => cd.display_name.toLowerCase().includes(filter))
  }

  checkCardBalance = assetsModule.checkCardBalance
  setCardToTransferSelected = assetsModule.setCardToTransferSelected
  setAllCardsToTransferSelected = assetsModule.setAllCardsToTransferSelected
  cards: CardDetail[] = []
  userCardsAmount: number = 0

  get state(): DashboardState {
    return this.$store.state
  }

  get cardBalance() {
    return this.state.assets.cardBalance
  }

  async mounted() {
    this.edition = null
    this.editions = this.editionNames.map((name) => (
      {
        id: name,
        name,
        cards: [],
        amount: 0,
      }
    ))
    await this.checkCardBalance()
    this.cards = await this.cardBalance
  }

  modal(ref: string) {
    return this.$refs[ref] as BModal
  }

  openTransferCardsModal(item) {
    this.setCardToTransferSelected(item)
    this.$root.$emit("bv::show::modal", "transfer-cards-modal")
  }

  openBatchTransferCardsModal() {
    if (this.edition !== null) {
      this.setAllCardsToTransferSelected({
        edition: this.edition.name,
        cards: this.edition.cards,
        amount: this.edition.amount,
      })
    } else {
      this.setAllCardsToTransferSelected({ edition: "All", cards: this.cards, amount: this.userCardsAmount })
    }
    this.$root.$emit("bv::show::modal", "transfer-all-cards-modal")
  }

  resetCardAmount() {
    this.editions.forEach((edition) => {
      edition.cards = []
      edition.amount = 0
    })
    this.userCardsAmount = 0
  }

  @Watch("cardBalance")
  async onUserCardChanged(
    newUserCards: CardDetail[],
    oldUserCards: CardDetail[],
  ) {
    this.resetCardAmount()
    if (newUserCards.length > 0) {
      this.cards = newUserCards
      const editionsMap = ["0", "1", "2", "3", "4"]
      this.cards.forEach((cd) => {
        const index = editionsMap.indexOf(cd.id.slice(-1))
        if (index === -1) throw new Error("Unknown edition for card " + cd.id)
        const edition = this.editions[index]
        edition.amount += cd.amount
        this.userCardsAmount += cd.amount
        edition.cards.push(cd)
      })
    }

    const cards = this.cards.filter((card) => {
      return this.state.assets.cardBalance.includes(card)
    })
    this.cards = cards
  }
}
</script>
<style lang="scss" scoped>
.card {
  border: none;
  box-shadow: rgba(219, 219, 219, 0.56) 0px 3px 8px 0px;
}
.cards-view {
  max-width: 600px;

  .card-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    background: none;
    > h4 {
      width: 100%;
      margin: 0 0 16px;
    }
  }
}

.list-group {
  height: calc(100vh - 229px);
  overflow-y: scroll;
}

.list-group-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background: transparent;
  border: 1px 0 solid rgba(0, 0, 0, 0.125);
  .name {
    flex: 1;
    white-space: nowrap;
  }
  .name,
  .balance {
    line-height: 36px;
    margin: 0;
  }
  .balance {
    flex: 1;
    text-align: right;
    > small {
      opacity: 0.8;
    }
  }
  .actions {
    width: 100%;
  }
}

/* bigger than mobile ----------- */
@media only screen and (min-width: 520px) {
  .card-header {
    flex-wrap: nowrap;
    > h4 {
      margin: 0 20px 0 0;
    }
  }
  .list-group-item {
    flex-wrap: nowrap;
    .balance {
      padding: 0 16px;
    }
    .actions {
      width: 120px;
    }
  }
}
</style>

