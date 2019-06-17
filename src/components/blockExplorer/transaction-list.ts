import Vue from "vue"

// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import BlockInfo from "./BlockInfo.vue"
// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import ConnectionStatus from "./ConnectionStatus.vue"
// @ts-ignore: Work around for https://github.com/Toilal/vue-webpack-template/issues/62
import TransactionTable from "./TransactionTable.vue"

import { Blockchain } from "./blockchain"
import { IBlockInfoProps } from "./block-info"
import {
  ITransactionTableProps,
  ITransactionTableColumn,
  TransactionTableColumnKey,
  ITransactionTableItem,
} from "./transaction-table"

interface ITxListData {
  sortBy: string
  sortDesc: boolean
  muted: string
  selectedItem: ITransactionTableItem | null
  isTxInfoVisible: boolean
}

const txTableColumns: ITransactionTableColumn[] = [
  { key: TransactionTableColumnKey.TxHash, sortable: false },
  { key: TransactionTableColumnKey.BlockHeight, sortable: true },
  { key: TransactionTableColumnKey.TxType, sortable: false },
  { key: TransactionTableColumnKey.Age, sortable: true },
  { key: TransactionTableColumnKey.Sender, sortable: false },
]

export default Vue.extend({
  name: "TransactionList",
  props: {
    blockchain: { type: Object, required: true },
  },
  data(): ITxListData {
    return {
      sortBy: "blockHeight",
      sortDesc: true,
      muted: "gray",
      selectedItem: null,
      isTxInfoVisible: false,
    }
  },
  computed: {
    txTableProps(): ITransactionTableProps {
      return {
        columns: txTableColumns,
        transactions: (this.blockchain as Blockchain).transactions,
        onRowClicked: this.onRowClicked,
      }
    },
    txInfoProps(): IBlockInfoProps {
      return {
        transaction: this.selectedItem ? this.selectedItem.tx : null,
        block: null,
        blockchain: this.blockchain,
        onCloseBtnClicked: this.closeBlockInfoOverlay,
      }
    },
  },
  methods: {
    onRowClicked(item: ITransactionTableItem /*, index: number, event: Event*/) {
      if (this.selectedItem) {
        this.isTxInfoVisible =
          this.selectedItem.blockHeight !== item.blockHeight || !this.isTxInfoVisible
      } else {
        this.isTxInfoVisible = true
      }
      this.selectedItem = item
    },
    closeBlockInfoOverlay() {
      this.isTxInfoVisible = false
    },
  },
  components: {
    BlockInfo,
    ConnectionStatus,
    TransactionTable,
  },
})
