import {
  IWithdrawalReceipt,
  IUnclaimedToken,
} from "loom-js/dist/contracts/transfer-gateway"
import { HasEthereumState } from "../ethereum/types"
import { HasPlasmaState, PlasmaSigner } from "../plasma/types"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import {
  Address,
  NonceTxMiddleware,
  SignedEthTxMiddleware,
  LocalAddress,
} from "loom-js"
import { ethers } from "ethers"
import { BareActionContext } from "vuex-typex"

// Gateway module depends on ethereum and plasma modules
export interface HasGatewayState extends HasEthereumState, HasPlasmaState {
  gateway: GatewayState
}

/**
 * Gateway state
 */
export interface GatewayState {
  mapping: IAddressMapping | null
  pendingTransactions: any[]
  withdrawalReceipts: { [token: string]: IWithdrawalReceipt | null }
}

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
      // @ts-ignore
      new SignedEthTxMiddleware(this.signer),
    ]
  }
}

export interface WithdrawalReceiptsV2 extends IWithdrawalReceipt {
  decodedSig: {
    valIndexes: Array<number | string>
    vs: Array<number | string>
    rs: Array<string | number[]>
    ss: Array<string | number[]>,
  }
}

/**
 * shorhand for gateway vuex module action context
 */
export declare type ActionContext = BareActionContext<
  GatewayState,
  HasGatewayState
>
