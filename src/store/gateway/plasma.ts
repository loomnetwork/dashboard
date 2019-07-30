import {
  TransferGateway,
  LoomCoinTransferGateway,
  BinanceTransferGateway,
} from "loom-js/dist/contracts"
import { Address, Client, Contract } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

import BN from "bn.js"
import { Funds, Transfer } from "@/types"
import { ActionContext, PlasmaGatewayAdapter } from "./types"
import { gatewayModule } from "@/store/gateway"
import { interval } from "rxjs"

import { filter, tap, switchMap, take } from "rxjs/operators"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import Web3 from "web3"
import { feedbackModule as feedback } from "@/feedback/store"
import { BinanceGatewayAdapter } from "./binance"
import { tokenService } from "@/services/TokenService"

import debug from "debug"
import { plasmaModule } from "../plasma"
import { TransferRequest } from "../plasma/types"
import * as Sentry from "@sentry/browser"

const log = debug("dash.gateway.plasma")

class LoomGatewayAdapter implements PlasmaGatewayAdapter {
  token = "LOOM"

  constructor(
    public contract: LoomCoinTransferGateway,
    readonly ethereumGateway: Address,
    readonly mapping: IAddressMapping,
  ) { }

  withdraw(amount: BN) {
    const ethereumLoomAddr = tokenService.getTokenAddressBySymbol("LOOM", "ethereum")
    // Address of Loom on Ethereum]
    const loomCoinAddress = Address.fromString(`eth:${ethereumLoomAddr}`)
    return this.contract.withdrawLoomCoinAsync(amount, loomCoinAddress)
  }
  async withdrawalReceipt() {
    const receipt = await this.contract.withdrawalReceiptAsync(this.mapping.to)
    return receipt
  }
}

class EthGatewayAdapter implements PlasmaGatewayAdapter {
  token = "ETH"

  constructor(
    public contract: TransferGateway,
    readonly ethereumGateway: Address,
    readonly mapping: IAddressMapping,
  ) { }

  withdraw(amount: BN) {
    return this.contract.withdrawETHAsync(amount, this.ethereumGateway)
  }
  withdrawalReceipt() {
    // const owner = this.contract.caller
    const owner = this.mapping.to
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
    const plasmaTokenAddrStr = tokenService.getTokenAddressBySymbol(this.token, "plasma")
    const plasmaTokenAddr = Address.fromString(`default:${plasmaTokenAddrStr}`)
    log("TransferGateway withdrawERC20Async", this.token, `default:${plasmaTokenAddrStr}`)
    return this.contract.withdrawERC20Async(amount, plasmaTokenAddr)
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
  const ethereumMainGateway = await TransferGateway.createAsync(client, mapping.from)
  const ethereumLoomGateway = await LoomCoinTransferGateway.createAsync(
    client,
    mapping.from,
  )
  // todo: add binance loom adapter
  const binanceGateway = await BinanceTransferGateway.createAsync(client, mapping.from)

  instance = new PlasmaGateways(ethereumMainGateway, ethereumLoomGateway, binanceGateway, plasmaWeb3, mapping)

  return instance
}

export function service() {
  return instance!
}

class PlasmaGateways {

  chains = new Map<string, Map<string, PlasmaGatewayAdapter>>()
  adapters = new Map<string, PlasmaGatewayAdapter>()

  constructor(
    readonly ethereumMainGateway: TransferGateway,
    readonly ethereumLoomGateway: LoomCoinTransferGateway,
    readonly binanceGateway: BinanceTransferGateway,
    readonly web3: Web3,
    readonly mapping: IAddressMapping,
  ) { }

  destroy() {
    this.adapters.clear()
  }

  // add chain payload
  get(chain: string, symbol: string): PlasmaGatewayAdapter {
    const chainAdapters = this.chains.get(chain)
    const adapter = chainAdapters!.get(symbol)

    if (adapter === undefined) {
      throw new Error("No gateway for " + symbol)
    }
    return adapter
  }

  /**
   *
   * @param chain
   * @param symbol
   * @param srcChainGateway required if srcChain has a gateway contract deployed
   */
  add(chain: string, symbol: string, srcChainGateway?: Address) {
    let adapter: PlasmaGatewayAdapter
    switch (symbol) {
      case "LOOM":
        adapter = new LoomGatewayAdapter(
          this.ethereumLoomGateway,
          srcChainGateway!,
          this.mapping,
        )
        break
      case "ETH":
        adapter = new EthGatewayAdapter(
          this.ethereumMainGateway,
          srcChainGateway!,
          this.mapping,
        )
        break

      // temp
      case "BNB":
        if (chain === "binance") {
          adapter = new BinanceGatewayAdapter(this.binanceGateway, this.mapping, {
            token: "BNB",
            amount: new BN(37500),
          })
          log("added BNB adapter")
          break
        }

      default:
        adapter = new ERC20GatewayAdapter(
          this.ethereumMainGateway,
          srcChainGateway!,
          symbol,
          this.mapping,
        )
        break
    }

    this.adapters.set(symbol, adapter)
    if (!this.chains.has(chain)) {
      this.chains.set(chain, new Map())
    }
    // @ts-ignore
    this.chains.get(chain).set(symbol, adapter)

  }
}

/* #region Vuex */

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */

export async function plasmaWithdraw(context: ActionContext, funds: Funds) {
  const { chain, symbol, weiAmount, recepient } = funds
  const gateway = service().get(chain, symbol)
  let receipt: IWithdrawalReceipt | null
  log("plasmaWithdraw", chain, symbol)

  try {
    feedback.setTask("withdraw")
    feedback.setStep("Checking for pre-existing receipts...")
    receipt = await gateway.withdrawalReceipt()
  } catch (err) {
    console.error(err)
    feedback.endTask()
    feedback.showError(" failed, to get receipt")
    Sentry.captureException(err)
    return
  }

  if (receipt) {
    log("Setting pre-existing receipt")
    // binance
    if (chain === "binance") {
      feedback.endTask()
      feedback.showAlert({
        title: "Withdrawal ongoing",
        message: "A withdrawal is still being processed. Please try again later.",
      })
      return
    }
    // ethereum, if pending etherum withdraw TX (confirmations less that 10)
    if (await gatewayModule.checkIfPastWithdrawalEventExists()) {
      feedback.endTask()
      feedback.showAlert({
        title: "Withdrawal ongoing",
        message: "An existing withdrawal is currently being processed. Please try again later.",
      })
      return
    }

    feedback.endTask()
    feedback.showInfo("Withdrawal already in progress.")
    gatewayModule.setWithdrawalReceipts(null)
    setTimeout(() => {
      gatewayModule.setWithdrawalReceipts(receipt)
    }, 1)
    return
  }

  const transfer = {
    ...funds,
    to: (gateway.contract as Contract).address.local.toString(),
    fee: gateway.fee,
  } as TransferRequest

  try {
    const approved = await plasmaModule.approve(transfer)
    if (approved === false) {
      return
    }
    feedback.setStep("Depositing to Plasmachain Gateway...")
    await gateway.withdraw(weiAmount, recepient)
    // For binance no more steps are required
    if (chain === "binance") {
      feedback.endTask()
      feedback.showInfo("Withdrawal request sent. Your binance account will receive the funds in a moment.")
      return
    }
    feedback.setStep("Awaiting Oracle signature...")
    receipt = await gatewayModule.pollReceipt(chain, symbol)
    gatewayModule.setWithdrawalReceipts(receipt)
    feedback.endTask()
  } catch (error) {
    console.error(error)
    console.log(error, error.handled)
    if (error.handled) {
      return
    }
    feedback.endTask()
    feedback.showError("Withdraw failed, please try again.")
    Sentry.withScope((scope) => {
      scope.setExtra("plasmaWithdraw", {
        withdraw: JSON.stringify({
          chain,
          symbol,
          amount: weiAmount.toString(),
        }),
      })
      Sentry.captureException(error)
    })
  }
}

export async function loadTokenMappings(context: ActionContext, chain: string) {
  if (chain === "ethereum") {
    const gateway = service().ethereumMainGateway
    context.state.ethereumMappings = await gateway.listContractMappingsAsync()
  } else if (chain === "binance") {
    const gateway = service().binanceGateway
    context.state.ethereumMappings = await gateway.listContractMappingsAsync()
  }
}

export async function binanceResubmitWithdrawal(context: ActionContext) {
  const gateway = service().binanceGateway
  feedback.setTask("withdraw")
  try {
    feedback.setStep("Completing withdrawal to binance...")
    await gateway.resubmitWithdrawalAsync()

  } catch (error) {
    console.error(error)
    feedback.endTask()
    feedback.showError("Withdraw failed, please try again.")
  }
  feedback.endTask()
}

export function pollReceipt(chain: string, symbol: string) {
  return interval(2000)
    .pipe(
      switchMap(() => refreshPendingReceipt(chain, symbol)),
      filter((receipt) => receipt !== null && receipt.oracleSignature.length > 0),
      take(1),
    )
    .toPromise()
}

export async function refreshWithdrawalReceipt(
  context: ActionContext, { chain, symbol }: { chain: string, symbol: string }) {
  const receipt = await refreshPendingReceipt(chain, symbol)
  log("refreshWithdrawalReceipt", chain, symbol, receipt)
  // @ts-ignore
  if (receipt !== null) {
    context.state.withdrawalReceipts = receipt
  }
}

async function refreshPendingReceipt(chain: string, symbol: string) {
  const gateway = service().get(chain, symbol)
  const receipt = await gateway.withdrawalReceipt()
  log("receipt", symbol, receipt)
  return receipt
}

/* #endregion */
