import { ethers } from "ethers"

import { WalletType, EthereumConfig } from "../types"

import WalletConnect from "@walletconnect/browser"
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal"

import Web3 from "web3"
import Connector from "@walletconnect/core"

export const WalletConnectAdapter: WalletType = {
  id: "walletconnect",
  name: "WalletConnect",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  detect() {
    return true
  },
  async initConnector(config: EthereumConfig) {

    // Create a walletConnector
    const walletConnector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
    })

    // Check if connection is already established
    if (!walletConnector.connected) {
      // create new session
      walletConnector.createSession().then(() => {
        // get uri for QR Code modal
        const uri = walletConnector.uri
        // display QR Code modal
        WalletConnectQRCodeModal.open(uri, () => {
          console.log("QR Code Modal closed")
        })
      })
    }

    // return walletConnector
    return new Promise((resolve, reject) => {

      // Subscribe to connection events
      walletConnector.on("connect", (error, payload) => {
        if (error) {
          reject(error)
        }

        // Close QR Code Modal
        WalletConnectQRCodeModal.close()

        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0]

        // Resolve promise once connected
        resolve(walletConnector)

      })

      walletConnector.on("session_update", (error, payload) => {
        if (error) {
          reject(error)
        }

        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0]
      })

      walletConnector.on("disconnect", (error, payload) => {
        if (error) {
          reject(error)
        }

        // Delete walletConnector
      })

    }) as Promise<Connector>

  },

}
