import Axios from 'axios'

import { extractTxDataFromStr, IDecodedTx } from './transaction-reader'

interface IBlockchainStatusResponse {
  result: {
    sync_info: {
      latest_block_height: number
    }
  }
}

interface IBlockchainBlockMeta {
  block_id: {
    hash: string
  }
  header: {
    height: number
    time: string
    num_txs: number
  }
}

export interface IBlockchainBlock {
  hash: string
  height: number
  time: string
  // Number of transactions that are supposed to be in this block.
  numTxs: number
  isFetchingTxs: boolean
  didFetchTxs: boolean
  // Transactions that have actually been fetched and successfully decoded.
  txs: IBlockchainTransaction[]
}

export interface IBlockchainTransaction {
  hash: string
  blockHeight: number
  txType: string
  time: string
  sender: string
  data: IDecodedTx
}

interface IBlockchainResponse {
  result: {
    last_height: number
    block_metas: IBlockchainBlockMeta[]
  }
}

interface IBlockResponse {
  result: {
    last_height: number
    block_meta: IBlockchainBlockMeta
  }
}

export interface IBlockchainStatus {
  latestBlockHeight: number
}

export class Blockchain {
  serverUrl: string
  allowedUrls: string[]
  isConnected: boolean = false
  blocks: IBlockchainBlock[] = []
  transactions: IBlockchainTransaction[] = []
  totalNumBlocks: number = 0
  refreshTimer: number | null = null

  constructor(params: { serverUrl: string; allowedUrls: string[] }) {
    this.serverUrl = params.serverUrl
    this.allowedUrls = params.allowedUrls
  }

  dispose() {
    this.clearRefreshTimer()
  }

  setServerUrl(newUrl: string) {
    if (this.serverUrl !== newUrl) {
      this.clearRefreshTimer()
      this.serverUrl = newUrl
      this.isConnected = false
      this.blocks = []
      this.transactions = []
      this.totalNumBlocks = 0
    }
  }

  setRefreshTimer() {
    if (this.refreshTimer === null) {
      this.refreshTimer = window.setInterval(async () => {
        const { latestBlockHeight } = await this.fetchStatus()
        this.totalNumBlocks = latestBlockHeight
      }, 5000)
    }
  }

  clearRefreshTimer() {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  async fetchStatus(): Promise<IBlockchainStatus> {
    const statusResp = await Axios.get<IBlockchainStatusResponse>(`${this.serverUrl}/status`)
    const latestBlockHeight = statusResp.data.result.sync_info.latest_block_height
    this.totalNumBlocks = latestBlockHeight
    return { latestBlockHeight }
  }

  /**
   * Fetches blocks from the blockchain, when called without any options will fetch up to 20
   * of the most recent blocks.
   *
   * @param opts Options object that can be used to specify which blocks are fetched.
   */
  async fetchBlocks(opts?: {
    minHeight?: number
    maxHeight?: number
    limit?: number
    autoFetch: boolean
  }): Promise<IBlockchainBlock[]> {
    this.clearRefreshTimer()
    try {
      // When a block range isn't specified we'll fetch the most recent ones, but to do that
      // we need to find out how many blocks there are.
      if (!opts || (opts.maxHeight === undefined && opts.minHeight === undefined)) {
        const { latestBlockHeight } = await this.fetchStatus()
        this.totalNumBlocks = latestBlockHeight
      }

      let maxBlocksToFetch = (opts && opts.limit) || 20
      let firstBlockNum = Math.max(this.totalNumBlocks - (maxBlocksToFetch - 1), 1)
      let lastBlockNum = this.totalNumBlocks
      // NOTE: the blockchain API endpoint currently only returns max of 20 blocks per request
      if (opts && opts.minHeight !== undefined) {
        firstBlockNum = opts.minHeight
        lastBlockNum = opts.maxHeight || firstBlockNum + maxBlocksToFetch - 1
      } else if (opts && opts.maxHeight !== undefined) {
        firstBlockNum = Math.max(opts.maxHeight - (maxBlocksToFetch - 1), 0)
        lastBlockNum = opts.maxHeight
      }
      const chainResp = await Axios.get<IBlockchainResponse>(`${this.serverUrl}/blockchain`, {
        params: {
          minHeight: firstBlockNum,
          maxHeight: lastBlockNum
        }
      })
      this.totalNumBlocks = chainResp.data.result.last_height
      this.isConnected = true
      // TODO: Connect to the websocket for updates instead of hammering the server.
      if (opts && opts.autoFetch) {
        this.setRefreshTimer()
      }
      return chainResp.data.result.block_metas.map<IBlockchainBlock>(meta => ({
        hash: meta.block_id.hash,
        height: meta.header.height,
        time: meta.header.time,
        numTxs: meta.header.num_txs,
        isFetchingTxs: false,
        didFetchTxs: false,
        txs: []
      }))
    } catch (e) {
      this.isConnected = false
      throw e
    }
  }

  async fetchBlock(blockHeight: number): Promise<IBlockchainBlock> {
    const chainResp = await Axios.get<IBlockResponse>(`${this.serverUrl}/block`, {
      params: { height: blockHeight }
    })
    const meta = chainResp.data.result.block_meta
    const block = {
      hash: meta.block_id.hash,
      height: meta.header.height,
      time: meta.header.time,
      numTxs: meta.header.num_txs,
      isFetchingTxs: false,
      didFetchTxs: false,
      txs: []
    }
    return block
  }

  async fetchTxsInBlock(block: IBlockchainBlock) {
    if (block.numTxs === 0 || block.isFetchingTxs || block.didFetchTxs) {
      return
    }
    try {
      block.isFetchingTxs = true
      const blockResp = await Axios.get<any>(`${this.serverUrl}/block`, {
        params: { height: block.height }
      })
      const rawTxs: any[] = blockResp.data.result.block.data.txs
      block.txs = []
      for (let i = 0; i < rawTxs.length; i++) {
        try {
          const data = extractTxDataFromStr(rawTxs[i])
          block.txs.push({
            hash: new Buffer(data.signed.sig).toString('hex'),
            blockHeight: block.height,
            txType: getTxType(data.tx),
            time: block.time,
            sender: getTxSender(data.tx),
            data: data.tx
          })
        } catch (e) {
          console.log(e)
        }
      }
      block.didFetchTxs = true
    } catch (e) {
      console.log(e)
    } finally {
      block.isFetchingTxs = false
    }
  }
}

export function getShortTxHash(longHash: string): string {
  return '0x' + longHash.slice(0, 8)
}

function getTxType(tx: IDecodedTx): string {
  return tx.method
}

function getTxSender(tx: IDecodedTx): string {
  // you could use the app user as the sender, please check delegatecall for example
  return 'default'
}
