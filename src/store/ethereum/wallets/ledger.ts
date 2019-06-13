/**
 * @module loomrx.ethereum
 */

import Web3ProviderEngine from "web3-provider-engine"

import TransportU2F from "@ledgerhq/hw-transport-u2f"
import createLedgerSubprovider from "@ledgerhq/web3-subprovider"
import FetchSubprovider from "web3-provider-engine/subproviders/fetch"

import Eth from "@ledgerhq/hw-app-eth"

import { WalletType, MultiAccountWallet, AccountInfo } from "../types"
import { Provider, Web3Provider } from "ethers/providers"

// import blockies from "ethereum-blockies"
import { merge, range } from "rxjs"
import { mergeMap, tap } from "rxjs/operators"
import { provider } from "web3-providers"

export const LedgerAdapter: any & WalletType & MultiAccountWallet = {
  id: "ledger",
  name: "ledger",
  detectable: false,
  isMultiAccount: true,
  desktop: true,
  mobile: false,
  detect() {
    return false
  },
  // cache loaded accounts
  loadedAccounts: new Map<string, AccountInfo>(),
  async createProvider() {
    throw new Error("not inple;ented")
  },
  get derivationPaths() {
    return [
      { label: "Ledger legacy", path: "" },
      { label: "ledger live", path: "" },
    ]
  },
  getAccounts(path: string, offset: number, count: number) {
    // getAddress(
    //     path: string,
    //     boolDisplay ? : boolean,
    //     boolChaincode ? : boolean,
    //   )

    return merge(
      [
        "0x5AbFEc25f74Cd88437631a7731906932776356f9",
        "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
      ].map(
        (address) =>
          ({
            address,
            // identicon: blockies.create({ seed: address }).toDataURL(),
            LOOM: 0,
            ETH: 0,
          } as AccountInfo),
      ),
    )
  },
}

/**
 * loads one account at a time and gets the balances
 * @param offset
 */
async function getAccount(offset) {}
// const logoPath = require("@/assets/ledger.svg"),

class LedgerWalletType implements WalletType, MultiAccountWallet {
  readonly id = "ledger"
  readonly name = "ledger"
  readonly detectable = false
  readonly isMultiAccount = true
  readonly desktop = true
  readonly mobile = false
  // readonly logo = logoPath

  private _transport: TransportU2F = null
  private _provider: any = null

  private _ledgerEth: Eth | null = null
  get ledgerEth() {
    if (this._ledgerEth === null) {
      this._ledgerEth = new Eth(this.transport)
    }
    return this._ledgerEth
  }

  get leddddgerEth() {
    if (this._provider === null) {
      const eth = new Eth(this.transport)

      const getTransport = () => this.transport
      const ledger = createLedgerSubprovider(getTransport, {
        networkId: 1,
        accountsLength: 10,
      })
      ledger.signMessage = ledger.signPersonalMessage
      const engine = new Web3ProviderEngine()
      engine.addProvider(ledger)
      engine.addProvider(
        new FetchSubprovider({
          rpcUrl: "https://mainnet.infura.io/5Ic91y0T9nLh6qUg33K0",
        }),
      )
      engine.start()
      this._provider = engine
    }
    return this._provider
  }

  get transport() {
    if (this._transport === null) {
      this._transport = TransportU2F.create()
    }
    return this._transport
  }

  async createProvider(): Promise<provider> {
    // const ethersProvider = new Web3Provider(this._provider)
    return this._provider
  }
  get derivationPaths() {
    return [
      { label: "Ledger legacy", path: "" },
      { label: "ledger live", path: "" },
    ]
  }

  getAccounts(path: string, offset: number, count: number) {
    const eth = this.ledgerEth
    return range(offset, count).pipe(
      mergeMap((i) => eth.getAddress(i, false, false), 1), // concurency 1
      tap(this.getBalances.bind(this)),
    )
  }

  getBalances(info) {}

  detect() {
    return false
  }
}
