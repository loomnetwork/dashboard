import { WalletType } from "../types"
import { provider } from "web3-providers"
import { ethereumModule } from ".."

export const BinanceChainWalletAdapter: WalletType = {
  id: "binance",
  name: "BinanceChain",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: false,

  detect() {
    return (window as any).BinanceChain !== undefined
  },

  async createProvider(): Promise<provider> {
    // @ts-ignore
    const bc = window.BinanceChain
    // bc.removeAllListeners() // NOTE: not implemented by Binance Wallet
    bc.autoRefreshOnNetworkChange = false

    bc.on("chainChanged", () => window.location.reload());
    
    let accounts: string[] = []
    try {
      accounts = await bc.request({ method: "eth_requestAccounts" })
    } catch (err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("Use rejected Binance Chain Wallet connection request")
      } else {
        console.error(err)
      }
    }

    await changeAccounts(accounts)

    bc.on("accountsChanged", accounts => {
      console.log(`accountsChanged ${accounts}`)
      changeAccounts(accounts).catch(err => console.error(err))
    })
    
    return bc
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
    ethereumModule.state.metamaskChangeAlert = true;
    // (window as any).BinanceChain.removeAllListeners() // NOTE: not implemented by Binance Wallet
  }
}
