import {
  Address,
  LocalAddress,
  NonceTxMiddleware,
  SignedEthTxMiddleware,
} from "loom-js"
import { ethers } from "ethers"
import { PlasmaSigner } from "../plasma/types"
import { feedbackModule } from "@/feedback/store"
import { i18n } from "@/i18n"

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
    feedbackModule.showInfo(i18n.t("feedback_msg.info.please_sign_tx").toString())
    try {
      const res = await handle(txData)
      feedbackModule.showInfo("")
      return res
    } catch (e) {
      if ((e as Error).message.includes("User denied message")) {
        feedbackModule.showError(i18n.t("messages.user_denied_sign_tx").toString());
        (e as any).handled = true
        feedbackModule.endTask()
      } else {
        feedbackModule.showError(
          i18n
            .t("messages.transaction_apprv_err_tx", { msg: (e as any).message })
            .toString(),
        )
        feedbackModule.endTask()
      }
      throw e
    }
  }
  return middleware
}

export function modifyRPCSigner(signer: ethers.Signer): ethers.Signer {
  const signMessage = signer.signMessage.bind(signer)
  signer.signMessage = async (txData) => {
    feedbackModule.showInfo(i18n.t("feedback_msg.info.please_sign_tx").toString())
    try {
      const res = await signMessage(txData)
      feedbackModule.showInfo("")
      return res
    } catch (e) {
      if ((e as Error).message.includes("User denied message")) {
        feedbackModule.showError(i18n.t("messages.user_denied_sign_tx").toString());
        (e as any).handled = true
        feedbackModule.endTask()
      } else {
        feedbackModule.showError(
          i18n
            .t("messages.transaction_apprv_err_tx", { msg: (e as Error).message })
            .toString(),
        )
        feedbackModule.endTask()
      }
      throw e
    }
  }
  return signer
}
