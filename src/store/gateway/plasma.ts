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
import { ethereumModule } from "../ethereum"

interface PlasmaGatewayAdapter {
  token: string

  withdraw(amount: BN)
  withdrawalReceipt(): Promise<IWithdrawalReceipt | null>
}

class LoomGatewayAdapter implements PlasmaGatewayAdapter {
  token = "LOOM"

  constructor(
    private contract: LoomCoinTransferGateway,
    readonly ethereumGateway: Address,
    readonly mapping: IAddressMapping,
  ) {}

  withdraw(amount: BN) {
    // Address of Loom on Ethereum]
    const loomCoinAddress = Address.fromString(
      // @ts-ignore
      `eth:${ethereumModule.state.erc20Addresses.LOOM}`,
    )
    this.contract.withdrawLoomCoinAsync(amount, loomCoinAddress)
  }
  async withdrawalReceipt() {
    return await this.contract.withdrawalReceiptAsync(this.mapping.to)
  }
}

class EthGatewayAdapter implements PlasmaGatewayAdapter {
  token = "ETH"

  constructor(
    public contract: TransferGateway,
    readonly ethereumGateway: Address,
    readonly mapping: IAddressMapping,
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
    mapping: IAddressMapping,
  ) {
    super(contract, ethereumGateway, mapping)
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
  const mainGateway = await TransferGateway.createAsync(client, mapping.from)
  const loomGateway = await LoomCoinTransferGateway.createAsync(
    client,
    mapping.from,
  )
  instance = new PlasmaGateways(mainGateway, loomGateway, plasmaWeb3, mapping)

  return instance
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
    readonly mapping: IAddressMapping,
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
      case "LOOM":
        adapter = new LoomGatewayAdapter(
          this.loomGateway,
          srcChainGateway,
          this.mapping,
        )
        break
      case "ETH":
        adapter = new EthGatewayAdapter(
          this.mainGateway,
          srcChainGateway,
          this.mapping,
        )
        break
      // case "tron":

      // break;

      default:
        adapter = new ERC20GatewayAdapter(
          this.mainGateway,
          srcChainGateway,
          token,
          this.mapping,
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
    console.log("Setting pre-existing receipt")
    gatewayModule.setWithdrawalReceipts(receipt)
    // tell user ongoing withdraw
    // CommonTypedStore.setErrorMsg("gateway.error.existing_receipt")
    return
  }
  try {
    await gateway.withdraw(funds.weiAmount)
    next()
    receipt = await gatewayModule.pollReceipt(funds.symbol)
    gatewayModule.setWithdrawalReceipts(receipt)
    next()
  } catch (error) {
    console.error(error)
    return
  }
}

export function pollReceipt(context: ActionContext, symbol: string) {
  return interval(2000)
    .pipe(
      switchMap(() => refreshPendingReceipt(context, symbol)),
      filter((receipt) => receipt !== null),
      take(1),
    )
    .toPromise()
}

async function refreshPendingReceipt(context: ActionContext, symbol: string) {
  const gateway = service().get(symbol)
  const receipt = await gateway.withdrawalReceipt()
  context.state.withdrawalReceipts = receipt
  return receipt
}

async function next() {
  gatewayModule.incrementWithdrawStateIdx()
  gatewayModule.setWithdrawStateAsCompleted()
}

/* #endregion */
