import {
  TransferGateway,
  LoomCoinTransferGateway,
  BinanceTransferGateway,
  BscTransferGateway,
} from "loom-js/dist/contracts"
import { Address, Client, Contract } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { TransferGatewayTxStatus } from "loom-js/dist/proto/transfer_gateway_pb"

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

import { i18n } from "@/i18n"

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

  async getLocalAccountInfo(owner: Address) {
    return this.contract.getLocalAccountInfoAsync(owner)
  }

  async getGatewayState() {
    return this.contract.getStateAsync()
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
  async getLocalAccountInfo(owner: Address) {
    return this.contract.getLocalAccountInfoAsync(owner)
  }
  async getGatewayState() {
    return this.contract.getStateAsync()
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
    const plasmaTokenAddr = Address.fromString(`${this.contract.address.chainId}:${plasmaTokenAddrStr}`)
    log("TransferGateway withdrawERC20Async", this.token, `${this.contract.address.chainId}:${plasmaTokenAddrStr}`)
    return this.contract.withdrawERC20Async(amount, plasmaTokenAddr)
  }
  async getLocalAccountInfo(owner: Address) {
    return this.contract.getLocalAccountInfoAsync(owner)
  }
  async getGatewayState() {
    return this.contract.getStateAsync()
  }
}

let instance: PlasmaGateways | null = null
export async function init(
  client: Client,
  plasmaWeb3: Web3,
  mapping: IAddressMapping,
  isConnectedToBsc: boolean,
) {

  const ethereumMainGateway = await TransferGateway.createAsync(client, mapping.from)
  const loomGatewayVariant = isConnectedToBsc ? BscTransferGateway : LoomCoinTransferGateway
  const ethereumLoomGateway = await loomGatewayVariant.createAsync(
    client,
    mapping.from,
  )

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
    readonly ethereumLoomGateway: LoomCoinTransferGateway | BscTransferGateway,
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

  // @return Gateway adapter registered for the given chain & symbol, or undefined if one doesn't
  //         exist.
  // NOTE: This is very similar to get() above, but doesn't needlessly throw errors.
  getGatewayAdapter(chain: string, symbol: string): PlasmaGatewayAdapter | undefined {
    const chainAdapters = this.chains.get(chain)
    if (chainAdapters === undefined) {
      console.warn(`No gateway adapters registered for ${chain}`)
      return undefined
    }
    return chainAdapters.get(symbol)
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
        if (chain === "binance") {
          adapter = new BinanceGatewayAdapter(this.binanceGateway, this.mapping, {
            token: "BNB",
            amount: new BN(37500),
          }, "LOOM")
          break
        } else {
          adapter = new LoomGatewayAdapter(
            this.ethereumLoomGateway,
            srcChainGateway!,
            this.mapping,
          )
        }
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
          }, "BNB")
          log("added BNB adapter")
          break
        }

      default:
        if (chain === "binance") {
          adapter = new BinanceGatewayAdapter(this.binanceGateway, this.mapping, {
            token: "BNB",
            amount: new BN(37500),
          }, symbol)
          break
        } else {
          adapter = new ERC20GatewayAdapter(
            this.ethereumMainGateway,
            srcChainGateway!,
            symbol,
            this.mapping,
          )
          break
        }
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
    feedback.setTask(i18n.t("feedback_msg.task.withdraw").toString())
    feedback.setStep(i18n.t("feedback_msg.step.checking_receipt").toString())
    receipt = await gateway.withdrawalReceipt()
  } catch (err) {
    console.error(err)
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.failed_to_get_receipt").toString())
    Sentry.captureException(err)
    return
  }

  if (receipt) {
    log("Setting pre-existing receipt")
    // binance
    if (chain === "binance") {
      feedback.endTask()
      feedback.showAlert({
        title: i18n.t("feedback_msg.alert.title.withdraw_ongoing").toString(),
        message: i18n.t("feedback_msg.alert.message.withdraw_in_process").toString(),
      })
      return
    }
    // ethereum, if pending etherum withdraw TX (confirmations less that 10)
    if (await gatewayModule.checkIfPastWithdrawalEventExists()) {
      feedback.endTask()
      feedback.showAlert({
        title: i18n.t("feedback_msg.alert.title.withdraw_ongoing").toString(),
        message: i18n.t("feedback_msg.alert.message.existing_withdraw_being_process").toString(),
      })
      return
    }

    feedback.endTask()
    feedback.showInfo(i18n.t("feedback_msg.info.withdrawal_in_progress").toString())
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
    feedback.setStep(i18n.t("feedback_msg.step.depositing_to_plasma").toString())
    await gateway.withdraw(weiAmount, recepient)
    // For binance no more steps are required
    if (chain === "binance") {
      feedback.endTask()
      feedback.showInfo(i18n.t("feedback_msg.info.withdrawal_request_sent").toString())
      return
    }
    feedback.setStep(i18n.t("feedback_msg.step.awaiting_oracle").toString())
    receipt = await gatewayModule.pollReceipt(chain, symbol)
    gatewayModule.setWithdrawalReceipts(receipt)
    feedback.endTask()
  } catch (error) {
    console.error(error)
    if ((error as any).handled) {
      return
    }
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.withdraw_failed").toString())
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
  feedback.setTask(i18n.t("feedback_msg.task.withdraw").toString())
  try {
    feedback.setStep(i18n.t("feedback_msg.step.complete_withdrawal_binance").toString())
    await gateway.resubmitWithdrawalAsync()

  } catch (error) {
    console.error(error)
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.withdraw_failed").toString())
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
  const receipt: IWithdrawalReceipt | null = await refreshPendingReceipt(chain, symbol)
  log("refreshWithdrawalReceipt", chain, symbol, receipt)
  // @ts-ignore
  if (receipt !== null) {
    if ((chain === "binance" && receipt.txStatus === TransferGatewayTxStatus.REJECTED) || chain !== "binance") {
    context.state.withdrawalReceipts = receipt
    }
  }
}

async function refreshPendingReceipt(chain: string, symbol: string) {
  const gateway = service().get(chain, symbol)
  const receipt = await gateway.withdrawalReceipt()
  log("receipt", symbol, receipt)
  return receipt
}

/* #endregion */
