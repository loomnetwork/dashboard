import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { VueConstructor } from "vue/types/vue"
import { mapGetters } from "vuex"
import BlockList from "../components/blockExplorer/block-list"
import TransactionList from "../components/blockExplorer/TransactionList.vue"

import { Blockchain } from "../components/blockExplorer/blockchain"

import FaucetSidebar from "../components/FaucetSidebar.vue"
import FaucetHeader from "../components/FaucetHeader.vue"
import FaucetFooter from "../components/FaucetFooter.vue"
import { DashboardState } from "@/types"

export enum BlockExplorerView {
  Blocks = "blocks",
  Transactions = "transactions",
}

export interface ISearchQuery {
  blockHeight: number | null | string
}

@Component({
  components: {
    TransactionList,
    BlockList,
    FaucetSidebar,
    FaucetHeader,
    FaucetFooter,
  },
  computed: {
    ...mapGetters(["currentRPCUrl"]),
  },
})
export default class BlockExplorer extends Vue {
  @Prop()
  view!: string
  @Prop({ default: true })
  showConnectionDropdown!: boolean
  @Prop({ default: () => ({ blockHeight: null }) })
  searchQuery!: ISearchQuery

  $refs!: {
    blockList: BlockList,
  }

  get dappchainEndpoint(): string {
    return (this.$store.state as DashboardState).plasma.endpoint
  }

  blockchain: Blockchain | null = null

  beforeDestroy() {
    if (this.blockchain) {
      this.blockchain.dispose()
      this.blockchain = null
    }
  }

  beforeMount() {
    this.blockchain = new Blockchain({
      serverUrl: this.dappchainEndpoint + "/rpc",
      allowedUrls: this.$store.state.allowedChainUrls,
    })
  }

  refresh() {
    this.blockchain!.setServerUrl(this.$store.state.chainUrl)

    this.$refs.blockList.onConnectionUrlChanged(this.$store.state.chainUrl)
  }

  get viewComponent(): VueConstructor {
    return this.view === BlockExplorerView.Transactions
      ? TransactionList
      : BlockList
  }

  get curSearchQuery(): ISearchQuery {
    return this.searchQuery
  }
}
