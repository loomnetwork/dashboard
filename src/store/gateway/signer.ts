import {
  Address,
  LocalAddress,
  NonceTxMiddleware,
  SignedEthTxMiddleware,
} from "loom-js"
import { ethers } from "ethers"
import { PlasmaSigner } from "../plasma/types"
import { feedbackModule } from "@/feedback/store"

/**
 *
 */
export class EthPlasmSigner implements PlasmaSigner {
  readonly chain = "eth"
  constructor(private signer: ethers.Signer) {}
  getAddress() {
    return this.signer.getAddress()
  }
  signAsync(message) {
    return this.signer.signMessage(message)
  }
  async configureClient(client) {
    const ethAddress = await this.getAddress()
    const callerAddress = new Address(
      "eth",
      LocalAddress.fromHexString(ethAddress),
    )

    client.txMiddleware = [
      new NonceTxMiddleware(callerAddress, client),
      initSignedEthMiddleware(this.signer),
    ]

  }
}

function initSignedEthMiddleware(signer: ethers.Signer): SignedEthTxMiddleware {
  const middleware = new SignedEthTxMiddleware(signer)
  const handle = middleware.Handle.bind(middleware)
  middleware.Handle = async (txData) => {
    feedbackModule.showInfo("Please sign the tx using your wallet.")
    try {
      const res = await handle(txData)
      feedbackModule.showInfo("")
      return res
    } catch (e) {
      feedbackModule.showInfo("")
      throw e
    }
  }
  return middleware
}

export function modifyRPCSigner(signer: ethers.Signer): ethers.Signer {
  const signMessage = signer.signMessage.bind(signer)
  signer.signMessage = async (txData) => {
    feedbackModule.showInfo("Please sign the tx using your wallet.")
    try {
      const res = await signMessage(txData)
      feedbackModule.showInfo("")
      return res
    } catch (e) {
      feedbackModule.showInfo("")
      throw e
    }
  }
  return signer
}
