import Vue from "vue"
import distanceInWordsToNow from "date-fns/distance_in_words_to_now"

import { IBlockchainTransaction, getShortTxHash } from "./blockchain"

export interface ITransactionTableItem {
  hash: string
  blockHeight: number
  txType: string
  age: string
  sender: string
  tx: IBlockchainTransaction
}

interface ITxTableData {
  sortBy: string
  sortDesc: boolean
  muted: string
}

export enum TransactionTableColumnKey {
  TxHash = "hash",
  BlockHeight = "blockHeight",
  TxType = "txType",
  Age = "age",
  Sender = "sender",
}

export interface ITransactionTableColumn {
  key: TransactionTableColumnKey
  sortable: boolean
}

export interface ITransactionTableProps {
  columns: ITransactionTableColumn[]
  transactions: IBlockchainTransaction[]
  onRowClicked?: (item: ITransactionTableItem, index: number, event: Event) => void
}

// Override some of the default labels generated from the column keys
const columnLabels: { [index: string]: string } = {
  [TransactionTableColumnKey.BlockHeight]: "Block",
  [TransactionTableColumnKey.TxType]: "Type",
}

export default Vue.extend({
  name: "TransactionTable",
  props: ["columns", "transactions", "onRowClicked"],
  data(): ITxTableData {
    return {
      sortBy: "blockHeight",
      sortDesc: true,
      muted: "gray",
    }
  },
  computed: {
    fields(): Array<{
      key: string
      label?: string
      sortable?: boolean,
    }> {
      return (this.columns as ITransactionTableColumn[]).map((col) => {
        return {
          key: col.key,
          label: columnLabels[col.key],
          sortable: col.sortable,
        }
      })
    },
    items(): ITransactionTableItem[] {
      return (this.transactions as IBlockchainTransaction[]).map<ITransactionTableItem>((tx) => ({
        hash: getShortTxHash(tx.hash),
        blockHeight: tx.blockHeight,
        txType: tx.txType,
        age: distanceInWordsToNow(new Date(tx.time)),
        sender: tx.sender,
        tx,
      }))
    },
  },
  methods: {
    rowClickHandler(item: ITransactionTableItem, index: number, event: Event) {
      if (this.onRowClicked) {
        this.onRowClicked(item, index, event)
      }
    },
  },
})
