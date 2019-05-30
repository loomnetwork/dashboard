import {
  TransferGateway,
  LoomCoinTransferGateway,
} from "loom-js/dist/contracts"
import { Address, CryptoUtils } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

import BN from "bn.js"
import { Funds } from "@/types"
import { ActionContext, WithdrawalReceiptsV2 } from "./types"
import { gatewayModule } from "."

import { timer, of, interval } from "rxjs"

import { filter, tap, switchMap, take } from "rxjs/operators"
import { CommonTypedStore } from "../common"
import { ethers } from "ethers"
import { parseSigs } from "loom-js/dist/helpers"
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"

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

const adapters = new Map<string, PlasmaGatewayAdapter>()

export function get(symbol: string): PlasmaGatewayAdapter {
  const adapter = adapters.get(symbol)
  if (adapter === undefined) {
    throw new Error("No gateway for " + symbol)
  }
  return adapter
}

export function addContract(
  symbol: string,
  contract: TransferGateway,
  srcChainGateway: Address,
) {
  let adapter: PlasmaGatewayAdapter
  switch (symbol) {
    case "loom":
      adapter = new LoomGatewayAdapter(
        contract as LoomCoinTransferGateway,
        srcChainGateway,
      )
      break
    case "eth":
      adapter = new EthGatewayAdapter(contract, srcChainGateway)
      break
    // case "tron":

    // break;

    default:
      adapter = new ERC20GatewayAdapter(contract, srcChainGateway, symbol)
      break
  }
  adapters.set(symbol, adapter)
}

/* #region Vuex */

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function withdraw(context: ActionContext, funds: Funds) {
  const gateway = get(funds.symbol)
  let receipt: IWithdrawalReceipt | null
  try {
    receipt = await gateway.withdrawalReceipt()
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
    gatewayModule.pollReceipt(funds.symbol)
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
  //     switchMap(() => pollForReceipt())
  //   )
  //   .subscribe(
  //     () => console.log("tell user to intiate ethereum withdraw"),
  //     (e) => console.error(e)
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
  const receipt = await get(symbol).withdrawalReceipt()
  context.state.withdrawalReceipts[symbol] = receipt
  return receipt
}

/* #endregion */
