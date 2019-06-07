import {
  TransferGateway,
  LoomCoinTransferGateway,
  Coin,
} from "loom-js/dist/contracts"
import { Address, CryptoUtils, Client } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

import BN from "bn.js"
import { Funds } from "@/types"
import { ActionContext, WithdrawalReceiptsV2 } from "./types"
import { gatewayModule } from "@/store/gateway"
import { timer, of, interval } from "rxjs"

import { filter, tap, switchMap, take } from "rxjs/operators"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import Web3 from "web3"

interface PlasmaGatewayAdapter {
  token: string

  withdraw(amount: BN)
  withdrawalReceipt(): Promise<IWithdrawalReceipt | null>
}

class LoomGatewayAdapter implements PlasmaGatewayAdapter {
  token = "loom"

  constructor(
    private contract: LoomCoinTransferGateway,
    readonly ethereumGateway: Address,
  ) {}

  withdraw(amount: BN) {
    this.contract.withdrawLoomCoinAsync(amount, this.ethereumGateway)
  }
  withdrawalReceipt() {
    const owner = this.contract.caller
    return this.contract.withdrawalReceiptAsync(owner)
  }
}

class EthGatewayAdapter implements PlasmaGatewayAdapter {
  token = "eth"

  constructor(
    public contract: TransferGateway,
    readonly ethereumGateway: Address,
  ) {}

  withdraw(amount: BN) {
    this.contract.withdrawETHAsync(amount, this.ethereumGateway)
  }
  withdrawalReceipt() {
    const owner = this.contract.caller
    return this.contract.withdrawalReceiptAsync(owner)
  }
}

class ERC20GatewayAdapter extends EthGatewayAdapter {
  token: string

  constructor(
    contract: TransferGateway,
    ethereumGateway: Address,
    token: string,
  ) {
    super(contract, ethereumGateway)
    this.token = token
  }

  withdraw(amount: BN) {
    this.contract.withdrawERC20Async(amount, this.ethereumGateway)
  }
  withdrawalReceipt() {
    const owner = this.contract.caller
    return this.contract.withdrawalReceiptAsync(owner)
  }
}

let instance: PlasmaGateways | null = null
export async function init(
  client: Client,
  plasmaWeb3: Web3,
  mapping: IAddressMapping,
) {

  // return new EthereumGateways()
  // create gateways and vmc (maybe vmc does not care...)
  const mainGateway = await TransferGateway.createAsync(client, mapping.to)
  const loomGateway = await LoomCoinTransferGateway.createAsync(
    client,
    mapping.to,
  )
  instance = new PlasmaGateways(mainGateway, loomGateway, plasmaWeb3)
}

export function service() {
  return instance!
}

class PlasmaGateways {
  adapters = new Map<string, PlasmaGatewayAdapter>()

  constructor(
    readonly mainGateway: TransferGateway,
    readonly loomGateway: LoomCoinTransferGateway,
    readonly web3: Web3,
  ) {}

  destroy() {
    this.adapters.clear()
  }

  get(symbol: string): PlasmaGatewayAdapter {
    const adapter = this.adapters.get(symbol)
    if (adapter === undefined) {
      throw new Error("No gateway for " + symbol)
    }
    return adapter
  }

  add(token: string, srcChainGateway: Address) {
    let adapter: PlasmaGatewayAdapter
    switch (token) {
      case "loom":
        adapter = new LoomGatewayAdapter(this.loomGateway, srcChainGateway)
        break
      case "eth":
        adapter = new EthGatewayAdapter(this.mainGateway, srcChainGateway)
        break
      // case "tron":

      // break;

      default:
        adapter = new ERC20GatewayAdapter(
          this.mainGateway,
          srcChainGateway,
          token,
        )
        break
    }
    this.adapters.set(token, adapter)
  }
}

/* #region Vuex */

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function plasmaWithdraw(context: ActionContext, funds: Funds) {
  const next = gatewayModule.incrementWithdrawStateIdx
  const gateway = service().get(funds.symbol)
  let receipt: IWithdrawalReceipt | null
  try {
    receipt = await gateway.withdrawalReceipt()
    next()
  } catch (error) {
    console.error(error)
    return
  }
  if (receipt) {
    // tell user ongoing withdraw
    // CommonTypedStore.setErrorMsg("gateway.error.existing_receipt")
    return
  }
  try {
    await gateway.withdraw(funds.weiAmount)
    next()
    gatewayModule.pollReceipt(funds.symbol)
    next()
  } catch (error) {
    console.error(error)
    return
  }

  // or rx style :)
  // of(gateway.withdrawalReceipt())
  //   .pipe(
  //     tap((x) => {if (x !== null) console.log("tell user withdraw on going")}),
  //     filter((x) => x === null),
  //     switchMap(() => gateway.withdraw(funds.weiAmount)),
  //     switchMap(() => gatewayModule.pollReceipt(funds.symbol)),
  //   )
  //   .subscribe(
  //     () => console.log("tell user to intiate ethereum withdraw"),
  //     (e) => console.error(e),
  //   )

}

export function pollReceipt(context: ActionContext, symbol: string) {
  interval(2000)
    .pipe(
      switchMap(() => gatewayModule.refreshPendingReceipt(symbol)),
      filter((receipt) => receipt !== null),
      take(1),
    )
    .subscribe()
}

export async function refreshPendingReceipt(
  context: ActionContext,
  symbol: string,
) {
  const gateway = service().get(symbol)
  const receipt = await gateway.withdrawalReceipt()
  context.state.withdrawalReceipts[symbol] = receipt
  return receipt
}

/* #endregion */
