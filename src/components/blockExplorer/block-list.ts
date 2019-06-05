import { Component, Prop, Vue } from "vue-property-decorator"
import distanceInWordsToNow from "date-fns/distance_in_words_to_now"
import formatDate from "date-fns/format"

// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import BlockInfo from "./BlockInfo.vue"
// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import ConnectionStatus from "./ConnectionStatus.vue"

import { IBlockInfoProps } from "./block-info"
import { Blockchain, IBlockchainBlock } from "./blockchain"
import { ISearchQuery } from "../../views/block-explorer"

interface IBlockListItem {
  blockHeight: number
  numTransactions: number
  hash: string
  age: string
  time: string
  block: IBlockchainBlock
}

@Component({
  components: {
    BlockInfo,
    ConnectionStatus,
  },
})
export default class BlockList extends Vue {
  @Prop({ required: true }) blockchain!: Blockchain // prettier-ignore
  @Prop({ default: true }) showConnectionDropdown!: boolean // prettier-ignore
  @Prop({ default: 10 }) blocksPerPage!: number // prettier-ignore
  // @Prop({ default: () => ({ blockHeight: null }) }) searchQuery!: ISearchQuery // prettier-ignore

  blockHeight: string | null = null
  sortBy = "blockHeight"
  sortDesc = true
  fields = [
    { key: "blockHeight", label: "Block", sortable: true },
    { key: "hash", label: "Hash", sortable: true },
    { key: "age", sortable: true },
    { key: "time", sortable: true },
  ]
  muted = "gray"
  selectedItem: IBlockListItem | null = null
  isBlockInfoVisible = false
  currentPage = 1
  perPage = this.blocksPerPage
  isBusy = false
  totalNumBlocks: number = 0
  refreshTimer: number | null = null

  beforeDestroy() {
    this.clearRefreshTimer()
  }

  setRefreshTimer() {
    if (this.refreshTimer === null) {
      this.refreshTimer = window.setInterval(() => {
        if (this.totalNumBlocks !== this.blockchain.totalNumBlocks && this.currentPage === 1) {
          this.totalNumBlocks = parseInt("" + this.blockchain.totalNumBlocks, 10)
          if (this.$refs.blocksTable) {
            (this.$refs.blocksTable as any).refresh()
          }
        }
      }, 5000)
    }
  }

  clearRefreshTimer() {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  async blocks(): Promise<IBlockListItem[]> {
    this.clearRefreshTimer()

    let minHeight: number | undefined
    let maxHeight: number | undefined
    let autoFetch = false
    const numPages = Math.ceil(this.totalNumBlocks / this.perPage)

    // NOTE: currently this code only works with the default sort order (most recent to least)
    if (this.currentPage === 1) {
      // first page
      autoFetch = true
    } else if (this.currentPage === numPages) {
      // last page
      minHeight = 1
    } else {
      maxHeight = Math.max(numPages - this.currentPage + 1, 1) * this.perPage
    }

    // Must return empty array on error so that b-table can update busy state
    let items: IBlockListItem[] = []
    try {
      const blocks = await this.blockchain.fetchBlocks({
        minHeight,
        maxHeight,
        limit: this.perPage,
        autoFetch,
      })
      items = blocks.map<IBlockListItem>((block) => ({
        blockHeight: block.height,
        numTransactions: block.numTxs,
        hash: block.hash,
        age: distanceInWordsToNow(new Date(block.time)),
        time: formatDate(new Date(block.time), "YYYY-MM-DD HH:mm:ss.SSS (Z)"),
        block,
      }))
    } catch (err) {
      console.error(err)
    }

    if (autoFetch) {
      this.setRefreshTimer()
    }
    this.totalNumBlocks = parseInt("" + this.blockchain.totalNumBlocks, 10)
    return items
  }

  async showBlock(blockHeight: number) {
    const block = await this.blockchain.fetchBlock(blockHeight)
    const item = {
      blockHeight: block.height,
      numTransactions: block.numTxs,
      hash: block.hash,
      age: distanceInWordsToNow(new Date(block.time)),
      time: formatDate(new Date(block.time), "YYYY-MM-DD HH:mm:ss.SSS (Z)"),
      block,
    }
    this.selectItem(item)
  }

  get blockInfoProps(): IBlockInfoProps {
    return {
      transaction: null,
      block: this.selectedItem ? this.selectedItem.block : null,
      blockchain: this.blockchain,
      onCloseBtnClicked: this.closeBlockInfoOverlay,
    }
  }

  get paginationAlignment(): string {
    return this.showConnectionDropdown ? "right" : "center"
  }

  selectItem(item: IBlockListItem) {
    if (this.selectedItem) {
      this.isBlockInfoVisible =
        this.selectedItem.blockHeight !== item.blockHeight || !this.isBlockInfoVisible
    } else {
      this.isBlockInfoVisible = true
    }
    this.selectedItem = item

    if (this.isBlockInfoVisible && this.selectedItem.block.numTxs > 0) {
      this.blockchain.fetchTxsInBlock(this.selectedItem.block)
    }
  }

  onRowClicked(item: IBlockListItem /*, index: number, event: Event*/) {
    // this.selectItem(item)
    // let blockHeight = item.blockHeight;
    this.showBlock(item.blockHeight)
  }

  closeBlockInfoOverlay() {
    this.isBlockInfoVisible = false
  }

  onConnectionUrlChanged(newUrl: string) {
    this.blockchain.setServerUrl(newUrl)
    this.currentPage = 1
    if (this.$refs.blocksTable) {
      (this.$refs.blocksTable as any).refresh()
    }
  }

  onUserInputUrl(url: string) {
    this.$store.commit("addChainUrl", { url })// .addChainUrl(url)
    this.onConnectionUrlChanged(url)
  }

  // setLocationSearch(url:string){
  //   window.location.search = `rpc=${url}`
  // }

  searchQuery(): ISearchQuery {
    let blockHeight: number | null = null
    if (this.blockHeight) {
      blockHeight = parseInt(this.blockHeight, 10)
      if (!Number.isInteger(blockHeight) || blockHeight < 0) {
        blockHeight = null
      }
    }
    return { blockHeight }
  }

  async searchWithBlockHeight() {
    if (this.blockHeight) {
      const blockHeight = parseInt(this.blockHeight!, 10)
      if (blockHeight <= 0) return
      // let block = await this.blockchain.fetchBlock(blockHeight);
      this.showBlock(blockHeight)
    }
  }

  // @Watch('searchQuery')
  // search(query: ISearchQuery) {
  //   if (query.blockHeight) {
  //     this.showBlock(query.blockHeight)
  //   }
  // }
}
