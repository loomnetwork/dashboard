import {
  TransferGateway,
  LoomCoinTransferGateway,
  Coin,
} from "loom-js/dist/contracts"
import { Address, CryptoUtils, Client, Contract } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

import BN from "bn.js"
import { Funds } from "@/types"
import { ActionContext, PlasmaGatewayAdapter } from "./types"
import { gatewayModule } from "@/store/gateway"
import { timer, of, interval } from "rxjs"

import { filter, tap, switchMap, take } from "rxjs/operators"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import Web3 from "web3"
import { ethereumModule } from "../ethereum"
import { feedbackModule as feedback } from "@/feedback/store"
import { BinanceLoomCoinTransferGateway } from "./binance"
import { tokenService } from "@/services/TokenService"

import debug from "debug"
import { plasmaModule } from "../plasma"

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
    console.log("TransferGateway withdrawERC20Async", this.token, `default:${plasmaTokenAddrStr}`)
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
  const binanceLoomGateway = await BinanceLoomCoinTransferGateway.createAsync()

  instance = new PlasmaGateways(ethereumMainGateway, ethereumLoomGateway, binanceLoomGateway, plasmaWeb3, mapping)

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
    readonly binanceLoomGateway: BinanceLoomCoinTransferGateway,
    readonly web3: Web3,
    readonly mapping: IAddressMapping,
  ) { }

  destroy() {
    this.adapters.clear()
  }

  // add chain payload
  get(chain: string, symbol: string): PlasmaGatewayAdapter {
    const chains = this.chains.get(chain)
    const adapter = chains!.get(symbol)

    if (adapter === undefined) {
      throw new Error("No gateway for " + symbol)
    }
    return adapter
  }

  add(chain: string, symbol: string, srcChainGateway: Address) {
    let adapter: PlasmaGatewayAdapter
    switch (symbol) {
      case "LOOM":
        adapter = new LoomGatewayAdapter(
          this.ethereumLoomGateway,
          srcChainGateway,
          this.mapping,
        )
        break
      case "ETH":
        adapter = new EthGatewayAdapter(
          this.ethereumMainGateway,
          srcChainGateway,
          this.mapping,
        )
        break
      // case "tron":

      // break;

      default:
        adapter = new ERC20GatewayAdapter(
          this.ethereumMainGateway,
          srcChainGateway,
          symbol,
          this.mapping,
        )
        break
    }

    const tmp = this.adapters.set(symbol, adapter)
    this.chains.set(chain, tmp)
    // this.adapters.set(symbol, adapter)
  }
}

/* #region Vuex */

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */

export async function plasmaWithdraw(context: ActionContext, funds: Funds) {
  const { chain, symbol, weiAmount } = funds
  const gateway = service().get(chain, symbol)
  let receipt: IWithdrawalReceipt | null
  try {
    feedback.setTask("withdraw")
    feedback.setStep("Checking for pre-existing receipts...")
    receipt = await gateway.withdrawalReceipt()
  } catch (err) {
    console.error(err)
    feedback.endTask()
    feedback.showError("Withdraw failed, please try again.")
    throw err
  }

  if (receipt) {
    console.log("Setting pre-existing receipt")

    const pastWithdrawals =  await gatewayModule.checkIfPastWithdrawalEventExists()
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

  try {
    await plasmaModule.approve({
      ...funds, to: (gateway.contract as Contract).address.local.toString(),
    })
    feedback.setStep("Depositing to Plasmachain Gateway...")
    await gateway.withdraw(weiAmount)
    feedback.setStep("Awaiting Oracle signature...")
    receipt = await gatewayModule.pollReceipt(chain, symbol)
    gatewayModule.setWithdrawalReceipts(receipt)
    localStorage.setItem("pendingWithdrawal", JSON.stringify(true))
    feedback.endTask()
  } catch (error) {
    console.error(error)
    feedback.endTask()
    feedback.showError("Withdraw failed, please try again.")
    throw new Error(error)
  }
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

async function refreshPendingReceipt(chain: string, symbol: string) {
  const gateway = service().get(chain, symbol)
  const receipt = await gateway.withdrawalReceipt()
  console.log("receipt", symbol, receipt)
  return receipt
}

async function next() {
  gatewayModule.incrementWithdrawStateIdx()
  gatewayModule.setWithdrawStateAsCompleted()
}

/* #endregion */
