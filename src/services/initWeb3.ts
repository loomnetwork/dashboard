import Web3 from "web3"
// @ts-ignore
// const ProviderEngine = require("web3-provider-engine")
import ProviderEngine from "web3-provider-engine"
// @ts-ignore
// const RpcSubprovider = require("web3-provider-engine/subproviders/rpc")

import TransportU2F from "@ledgerhq/hw-transport-u2f"
import createLedgerSubprovider from "@ledgerhq/web3-subprovider"
import FetchSubprovider from "web3-provider-engine/subproviders/fetch"
import RpcSubprovider from "web3-provider-engine/subproviders/rpc.js"

export function initWeb3Hardware(): Promise<Web3> {
  return new Promise(async (resolve, reject) => {
    const engine = new ProviderEngine()
    const getTransport = () => TransportU2F.create()
    const ledger = createLedgerSubprovider(getTransport, {
      networkId: 1,
      accountsLength: 5,
    })

    ledger.getAccounts = () => ["123"]

    ledger.signMessage = ledger.signPersonalMessage
    engine.addProvider(ledger)
    engine.addProvider(
      new FetchSubprovider({
        rpcUrl: "https://mainnet.infura.io/5Ic91y0T9nLh6qUg33K0",
      }),
    )
    engine.start()
    resolve(new Web3(engine))
  })
}

/**
 *
 * @param {*} path
 */
export function initWeb3SelectedWallet(
  path: string,
  rpcUrl: string,
  networkId: number = 1,
  accountsLength: number = 5,
) {
  return new Promise(async (resolve, reject) => {
    const engine = new ProviderEngine()
    const getTransport = () => TransportU2F.create()
    const ledger = createLedgerSubprovider(getTransport, {
      networkId,
      // maybe we only need 1 now that we solved this
      accountsLength,
      path,
    })

    ledger.signMessage = ledger.signPersonalMessage
    engine.addProvider(ledger)
    engine.addProvider(
      // new RpcSubprovider({ rpcUrl }),
      new FetchSubprovider({
        rpcUrl,
      }),
    )
    engine.start()
    resolve(engine)
  })
}

/**
 *initWeb3SelectedWalletBeta
 * @param {*} path
 */
export function initWeb3SelectedWalletBeta(path: string) {
  return new Promise<any[]>(async (resolve, reject) => {
    // const engine = new ProviderEngine()
    const getTransport = () => TransportU2F.create()
    const ledger = createLedgerSubprovider(getTransport, {
      networkId: 1,
      accountsLength: 10,
      path,
    })
    ledger.getAccounts((err, val: any[]) => {
      if (err) reject(err)
      resolve(val)
    })
  })
}
export function initWeb3() {
  return new Promise<Web3>(async (resolve, reject) => {
    let myWeb3: Web3
    if ("ethereum" in window) {
      // @ts-ignore
      myWeb3 = new Web3(ethereum)
      try {
        // @ts-ignore
        await ethereum.enable()
      } catch (err) {
        reject("User denied access to Metamask")
      }
    } else if ("web3" in window) {
      // @ts-ignore
      myWeb3 = new Web3(window.web3.currentProvider)
    } else {
      return reject("no Metamask installation detected")
    }
    // @ts-ignore
    window.web3 = myWeb3
    resolve(myWeb3)
  })
}

// export const init2 = async () => {
//   let web3js
//   if (window.ethereum) {
//     window.web3 = new Web3(ethereum)
//     web3js = new Web3(ethereum)
//     try {
//       await ethereum.enable()
//     } catch (err) {
//       // this.setErrorMsg("User denied access to Metamask")
//       console.error(err)
//       return
//     }
//   } else if (window.web3) {
//     window.web3 = new Web3(window.web3.currentProvider)
//     web3js = new Web3(window.web3.currentProvider)
//   } else {
//     // this.setErrorMsg('Metamask is not Enabled')
//   }

//   return web3js
// }
