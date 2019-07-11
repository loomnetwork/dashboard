/**
 * @module loomrx.ethereum
 */

import Web3ProviderEngine from "web3-provider-engine"
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
