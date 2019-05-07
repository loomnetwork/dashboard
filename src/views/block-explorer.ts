import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { VueConstructor } from 'vue/types/vue'
import { mapGetters } from 'vuex'
// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import BlockList from '../components/blockExplorer/BlockList.vue'
// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import TransactionList from '../components/blockExplorer/TransactionList.vue'

import { Blockchain } from '../components/blockExplorer/blockchain'

import FaucetSidebar from '../components/FaucetSidebar.vue'
import FaucetHeader from '../components/FaucetHeader.vue'
import FaucetFooter from '../components/FaucetFooter.vue'

export enum BlockExplorerView {
  Blocks = 'blocks',
  Transactions = 'transactions'
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
    FaucetFooter
  },
  computed: {
    ...mapGetters([
      "currentRPCUrl"
    ])
  }
})
export default class BlockExplorer extends Vue {
  @Prop() view!: string // prettier-ignore
  @Prop({ default: true }) showConnectionDropdown!: boolean // prettier-ignore
  @Prop({ default: () => ({ blockHeight: null }) }) searchQuery!: ISearchQuery // prettier-ignore

  @Getter("dappchainEndpoint", { namespace: "DappChain" })
  dappchainEndpoint

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
      allowedUrls: this.$store.state.allowedChainUrls
    })
  }

  refresh() {
    this.blockchain!.setServerUrl(this.$store.state.chainUrl);
    (this.$refs.blockList as BlockList).onConnectionUrlChanged(this.$store.state.chainUrl)
  }

  get viewComponent(): VueConstructor {
    return this.view === BlockExplorerView.Transactions ? TransactionList : BlockList
  }

  get curSearchQuery(): ISearchQuery {
    return this.searchQuery
  }
}
