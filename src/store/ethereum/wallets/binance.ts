import Web3 from "web3"
import { getMetamaskSigner } from "loom-js"
import { ethers } from "ethers"

import { IWalletProvider, WalletType } from "../types"
import { ethereumModule } from ".."

export const BSC_SAFE_BLOCK_WAIT_TIME_MS = 15000

export const BinanceChainWalletAdapter: WalletType = {
  id: "binance",
  name: "Binance Chain",
  logo: require("@/assets/binance_wallet_logo.svg"),
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: false,

  detect() {
    return (window as any).BinanceChain !== undefined
  },

  async createProvider(): Promise<IWalletProvider> {
    // @ts-ignore
    const bc = window.BinanceChain
    // bc.removeAllListeners() // NOTE: not implemented by Binance Wallet

    bc.autoRefreshOnNetworkChange = false
    // @ts-ignore
    bc.on("chainChanged", () => ethereumModule.commitSetWalletNetworkId(parseInt(window.BinanceChain.chainId, 16)))

    let accounts: string[] = []
    try {
      accounts = await bc.request({ method: "eth_requestAccounts" })
    } catch (err) {
      if ((err as any).code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("Use rejected Binance Chain Wallet connection request")
      } else {
        console.error(err)
      }
    }

    await changeAccounts(accounts)

    bc.on("accountsChanged", (_accounts) => {
      console.log(`accountsChanged ${_accounts}`)
      changeAccounts(_accounts).catch((err) => console.error(err))
    })

    bc.isBCWallet = true

    const signer = getMetamaskSigner(bc)

    return {
      web3: new Web3(bc),
      signer: patchSigner(signer),
      chainId: parseInt(bc.chainId, 16),
      disconnect: () => Promise.resolve(),
    }
  },
}

async function changeAccounts(accounts: string[]) {
  if (accounts.length === 0) {
    console.error("Wallet is locked or the user has not connected any accounts")
    return
  }

  // TODO: this is to resolve a bug with mismatched receipts, once all users are fixed, please remove.
  // @ts-ignore
  if (window.resolvingMismatchedReceipt) {
    return
  }
  if (ethereumModule.state.address &&
    ethereumModule.state.address.toLowerCase() !== accounts[0]) {
    // Remove any reference to past withdrawals as it is bound to a specific address
    localStorage.removeItem("lastWithdrawTime")
    ethereumModule.state.metamaskChangeAlert = true
    // (window as any).BinanceChain.removeAllListeners() // NOTE: not implemented by Binance Wallet
  }
}

/**
 * https://github.com/loomnetwork/dashboard/issues/1421
 * NOTE: based on ethers 5.7.0!
 */
function patchSigner(signer: ethers.Signer) {
  const patch = async (message: string | ethers.utils.Bytes) => {
    const data = ((typeof (message) === "string") ? ethers.utils.toUtf8Bytes(message) : message)
    const address = await signer.getAddress()
    // @ts-expect-error
    return signer.provider.provider.bnbSign(address, ethers.utils.hexlify(data))
      .then((result) => result.signature)
      .catch((result) => { throw new Error(`Binance wallet bnbSign failed: ${result.error}`) })

  }
  signer.signMessage = patch
  return signer
}

export function isBCWallet(wallet: IWalletProvider | null) {
  return wallet != null && (wallet.web3.currentProvider as any).isBCWallet
}
