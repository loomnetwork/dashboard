import { feedbackModule as fb, feedbackModule } from "@/feedback/store"
import { i18n } from "@/i18n"
import { tokenService } from "@/services/TokenService"
import { Funds } from "@/types"
import { ZERO } from "@/utils"
import * as Sentry from "@sentry/browser"
import Axios from "axios"
import BN from "bn.js"
import debug from "debug"
import { ethers } from "ethers"
import { CryptoUtils, parseSigs } from "loom-js"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { abi as GatewayABIv1, EthereumGatewayV1__factory as EthereumGatewayV1Factory } from "loom-js/dist/mainnet-contracts/factories/EthereumGatewayV1__factory"
import { abi as GatewayABIv2, EthereumGatewayV2__factory as EthereumGatewayV2Factory } from "loom-js/dist/mainnet-contracts/factories/EthereumGatewayV2__factory"
import { abi as ValidatorManagerV2FactoryABI } from "loom-js/dist/mainnet-contracts/factories/ValidatorManagerV2__factory"
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb"
import { from } from "rxjs"
import { filter, mergeMap, tap, toArray } from "rxjs/operators"
import Web3 from "web3"
import type { Contract } from "web3-eth-contract"
import { AbiItem } from "web3-utils"
import { ethereumModule } from "../ethereum"
import { PlasmaTokenKind } from "../plasma/types"
// these are v2 types
import { Gateway } from "./contracts/Gateway"
// XXX
import { ValidatorManagerContract } from "./contracts/ValidatorManagerContract"
import { gatewayModule } from "./index"
import { ActionContext, WithdrawalReceiptsV2 } from "./types"

import { isBCWallet } from "../ethereum/wallets/binance"

const log = debug("dash.gateway.ethereum")

/**
 * each token has specic methods for deposit and withdraw (and specific contract in case of loom coin)
 * EthereumGatewayAdapter is a simple abstraction to make those APIs uniform
 */
interface EthereumGatewayAdapter {
  token: string
  contract: Contract

  deposit(amount: BN, address: string)
  withdraw(receipt: IWithdrawalReceipt)

}

class ERC20GatewayAdapter implements EthereumGatewayAdapter {
  constructor(
    private vmc: ValidatorManagerContract | null,
    readonly contract: Contract,
    readonly tokenAddress: string,
    readonly token: string,
  ) { }

  deposit(amount: BN, address: string) {
    return (
      this.contract.methods
        .depositERC20(amount.toString(), this.tokenAddress)
        .send({
          from: address,
        })
    )
  }

  async withdraw(receipt: IWithdrawalReceipt) {
    const amount = receipt.tokenAmount!.toString()
    const localAddress = receipt.tokenOwner.local.toString()
    const tokenAddress = this.tokenAddress
    log("withdraw ERC20", receipt, amount)
    if (receipt.tokenKind !== TransferGatewayTokenKind.LOOMCOIN) {
      console.assert(
        tokenAddress.toLocaleLowerCase() === receipt.tokenContract!.local.toString(),
        "Receipt contract address different from current contract",
        receipt.tokenContract!.local.toString(),
        tokenAddress,
      )
    }

    let tx
    // multisig
    if (this.vmc) {
      const { decodedSig } = await decodeSig(receipt, this.contract, this.vmc)
      const { valIndexes, vs, ss, rs } = decodedSig
      tx = await this.contract.methods
        .withdrawERC20(amount, tokenAddress, valIndexes, vs, rs, ss)
        .send({ from: localAddress })
    } else {
      const signature = CryptoUtils.bytesToHexAddr(receipt.oracleSignature)
      tx = await this.contract.methods
        .withdrawERC20(amount, signature, tokenAddress)
        .send({ from: localAddress })
    }

    ethereumModule.setLatestWithdrawalBlock(tx.blockNumber)

    return tx
  }
}

/**
 * adapts eth deposit/withdraw calls to EthereumGatewayAdapter
 */
class EthGatewayAdapter implements EthereumGatewayAdapter {
  token = "ETH"

  constructor(
    private vmc: ValidatorManagerContract | null,
    readonly contract: Contract,
    readonly tokenAddress: string,
    readonly web3: Web3,
  ) { }

  async deposit(amount: BN, sender: string) {
    console.log({
      from: sender,
      to: this.contract.options.address,
      value: amount.toString()
    })
    return await this.web3.eth.sendTransaction({
      from: sender,
      to: this.contract.options.address,
      value: amount.toString(),
    })
  }

  async withdraw(receipt: IWithdrawalReceipt) {
    const localAddress = receipt.tokenOwner.local.toString()
    // for ETH amount is in value no tokenAmount
    const amount = receipt.value.toString()
    log("withdraw ETH", receipt, amount)
    // multisig
    if (this.vmc) {
      const { decodedSig } = await decodeSig(receipt, this.contract, this.vmc)
      const { valIndexes, vs, ss, rs } = decodedSig
      return this.contract.methods.withdrawETH(
        amount,
        valIndexes, vs, rs, ss,
      ).send({ from: localAddress })
    } else {
      const signature = CryptoUtils.bytesToHexAddr(receipt.oracleSignature)
      return this.contract.methods.withdrawETH(amount.toString(), signature)
        .send({ from: localAddress })

    }

  }
}

let instance: EthereumGateways | null = null
export async function init(
  web3: Web3,
  addresses: { mainGateway: string; loomGateway: string },
  version: { main: 1 | 2, loom: 1 | 2 },
) {
  // @ts-expect-error 2322 ... readonly cannot be assigned to mutable type AbiItem[]
  const ERC20GatewayABI: AbiItem[] = version.loom === 2 ? GatewayABIv2 : GatewayABIv1
  // @ts-expect-error 2322 ... readonly cannot be assigned to mutable type AbiItem[]1
  const GatewayABI: AbiItem[] = version.main === 2 ? GatewayABIv2 : GatewayABIv1
  const loomGateway = new web3.eth.Contract(
    ERC20GatewayABI,
    addresses.loomGateway,
  )
  log("loom gateway initialized")

  let mainGateway: Gateway | null = null
  if (addresses.mainGateway !== ethers.constants.AddressZero) {
    mainGateway = new web3.eth.Contract(
      GatewayABI as AbiItem[],
      addresses.mainGateway,
    )
    log("main gateway initialized")
  }
  let vmcContract: any = null
  let vmcSourceGateway: any = null
  if (version.loom === 2) {
    vmcSourceGateway = loomGateway
  } else if ((version.main === 2) && mainGateway) {
    vmcSourceGateway = mainGateway
  }
  if (vmcSourceGateway) {
    const vmcAddress = await vmcSourceGateway.methods.vmc().call()
    log("vmc address", vmcAddress)
    vmcContract = new web3.eth.Contract(
      // @ts-expect-error 2322 ... readonly cannot be assigned to mutable type AbiItem[]
      ValidatorManagerV2FactoryABI,
      vmcAddress,
    )
    log("vmc initialized")
  } else {
    log("Assuming oracle sig gateways")
  }
  instance = new EthereumGateways(mainGateway, loomGateway, vmcContract, web3, version)
  return instance
}

export function service() {
  return instance!
}

/**
 * A service to make interactions with ethereum gateways easier
 */
class EthereumGateways {
  private adapters = new Map<string, EthereumGatewayAdapter>()

  /**
   *
   * @param mainGateway
   * @param loomGateway
   * @param vmc null if not multisig
   * @param web3
   */
  constructor(
    readonly mainGateway: Contract | null,
    readonly loomGateway: Contract,
    readonly vmc: ValidatorManagerContract | null,
    readonly web3: Web3,
    readonly version: { main: 1 | 2, loom: 1 | 2 },
  ) { }

  destroy() {
    this.adapters.clear()
  }

  get(symbol: string): EthereumGatewayAdapter {
    const adapter = this.adapters.get(symbol)
    if (adapter === undefined) {
      throw new Error("No gateway for " + symbol)
    }
    return adapter
  }

  add(token: string, tokenAddress: string) {
    if (this.adapters.has(token)) {
      console.warn(token + " token gateway adapter already set.")
      return this.adapters.get(token)
    }
    const { mainGateway, loomGateway, web3, version } = this
    let adapter: EthereumGatewayAdapter
    let vmc: ValidatorManagerContract | null
    switch (token) {
      case "ETH":
        if (mainGateway === null) {
          throw new Error(`Can't add token ${token} because gateway doesn't exist`)
        }
        vmc = version.main === 2 ? this.vmc : null
        adapter = new EthGatewayAdapter(vmc, mainGateway, "", web3)
        break
      case "LOOM":
        vmc = version.loom === 2 ? this.vmc : null
        adapter = new ERC20GatewayAdapter(vmc, loomGateway, tokenAddress, token)
        break
      default:
        if (mainGateway === null) {
          throw new Error(`Can't add token ${token} because gateway doesn't exist`)
        }
        vmc = version.main === 2 ? this.vmc : null
        adapter = new ERC20GatewayAdapter(vmc, mainGateway, tokenAddress, token)
        break
    }

    // todo cleanup if already set
    this.adapters.set(token, adapter)
    return adapter
  }
}

export async function refreshAllowances(context: ActionContext) {
  const coins = context.rootState.ethereum.coins
  const gateways = service()
  const allowances = from(Object.keys(coins))
    .pipe(
      // no allowance for eth
      filter((symbol) => symbol !== "ETH"),
      tap(log),
      mergeMap(async (symbol) => {
        const spender = gateways.get(symbol).contract.options.address
        const amount = await ethereumModule.allowance({ symbol, spender })
        return { token: tokenService.getTokenbySymbol(symbol), amount }
      }),
      filter((allowance) => allowance.amount.gt(ZERO)),
      toArray(),
    ).toPromise()

  context.state.ethereumAllowances = await allowances
  log("allowances", context.state.ethereumAllowances)
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function ethereumDeposit(context: ActionContext, funds: Funds) {
  const { chain, symbol, weiAmount } = funds
  const gateway = service().get(funds.symbol)
  if (funds.symbol === "ETH") {
    feedbackModule.setTask(i18n.t("feedback_msg.task.eth_deposit").toString())
    feedbackModule.setStep(i18n.t("feedback_msg.step.depositing_eth").toString())
    try {
      const tx = await gateway.deposit(weiAmount, context.rootState.ethereum.address)
      if (tx.transactionHash) await gatewayModule.checkTxStatus(tx.transactionHash)
      feedbackModule.endTask()
    } catch (e) {
      feedbackModule.endTask()
      if ("imToken" in window) {
        console.log("imToken error", e)
        feedbackModule.showInfo(i18n.t("feedback_msg.info.please_track_transaction").toString())
      } else {
        console.error(e)
        feedbackModule.showError(i18n.t("feedback_msg.error.could_not_deposit_eth").toString())
        Sentry.withScope((scope) => {
          scope.setExtra("ethereumDeposit", {
            funds: JSON.stringify({
              chain,
              symbol,
              amount: weiAmount.toString(),
            }),
          })
          Sentry.captureException(e)
        })
      }
    }
    return
  }

  fb.showLoadingBar(true)
  const approvalAmount = await ethereumModule.allowance({
    symbol,
    spender: gateway.contract.options.address,
  })
  if (weiAmount.gt(approvalAmount)) {
    try {
      await ethereumModule.approve({
        to: gateway.contract.options.address,
        ...funds,
      })
      fb.showLoadingBar(false)
    } catch (err) {
      if ("imToken" in window) {
        console.log("imToken error", err)
        fb.showInfo(i18n.t("feedback_msg.info.please_track_deposit_approval").toString())
      } else {
        console.error(err)
        fb.showError(i18n.t("feedback_msg.error.deposit_approval_failed").toString())
      }
      console.log(err)
      fb.showLoadingBar(false)
      Sentry.withScope((scope) => {
        scope.setExtra("ethereumDeposit", {
          funds: JSON.stringify({
            chain,
            symbol,
            amount: weiAmount.toString(),
          }),
          spender: JSON.stringify(gateway.contract.options.address.toString()),
        })
        Sentry.captureException(err)
      })
      return
    }
  }
  fb.requireConfirmation({
    title: i18n.t("feedback_msg.require_confirmation.title.complete_deposit"),
    message: i18n.t("feedback_msg.require_confirmation.message.please_sign_click"),
    onConfirm: async () => {
      try {
        fb.showLoadingBar(true)
        await gateway.deposit(
          funds.weiAmount,
          context.rootState.ethereum.address,
        )
        fb.showSuccess(i18n.t("components.gateway.deposit.confirmed").toString())
      } catch (err) {
        let sendToSentry = true
        // NOTE remove this when BSC supports websocket
        if (isBCWallet(context.rootState.ethereum.wallet) &&
          (err as any).message.includes("Failed to subscribe to new newBlockHeaders to confirm the transaction receipts")) {
          fb.showSuccess(i18n.t("components.gateway.deposit.confirmed").toString())
          sendToSentry = false
        } else if ("imToken" in window) {
          console.log("imToken error", err)
          fb.showInfo(i18n.t("feedback_msg.info.please_track_transaction").toString())
        } else {
          console.error(err)
          fb.showError(i18n.t("components.gateway.deposit.failure").toString())
        }
        if (sendToSentry) {
          Sentry.withScope((scope) => {
            scope.setExtra("ethereumDeposit", {
              funds: JSON.stringify({
                chain,
                symbol,
                amount: weiAmount.toString(),
              }),
            })
            Sentry.captureException(err)
          })
        }
      } finally {
        fb.showLoadingBar(false)
      }
    },
  })
}

/**
 * Check status of tx via etherscan api
 * @param {*} address
 */
export async function checkTxStatus(context: ActionContext, tx: string) {
  return Axios
    .get(`//${context.rootState.ethereum.blockExplorerApi}?module=transaction&action=getstatus&txhash=${tx}`)
    .then((response) => {
      const { isError, errDescription } = response.data.result
      if (isError === "0") {
        fb.showSuccess(i18n.t("components.gateway.deposit.confirmed").toString())
      } else {
        switch (errDescription) {
          case "out of gas":
            feedbackModule.showError(i18n.t("messages.transaction_out_of_gas").toString())
            break

          default:
            console.error(errDescription)
            fb.showError(i18n.t("components.gateway.deposit.failure").toString())
            break
        }
      }
    })
    .catch((e) => {
      console.error("Error querying etherscan api", e)
    })
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export async function ethereumWithdraw(context: ActionContext, token_: string) {
  const receipt = context.state.withdrawalReceipts
  if (receipt === null || receipt === undefined) {
    console.error("no withdraw receipt in state")
    return
  }
  const tokenAddress = receipt.tokenContract!.local.toString().toLowerCase()
  let token: string
  // ETH case tokenAddress is gateway address
  if (tokenAddress === context.rootState.ethereum.contracts.mainGateway.toLowerCase()) {
    console.log("eth withdraw")
    token = "ETH"
  } else {
    const tokenInfo = tokenService.tokenFromAddress(tokenAddress, "ethereum")
    if (tokenInfo === null) {
      console.error("token contract address in receipt unknown ", tokenInfo)
      fb.showError(i18n.t("feedback_msg.error.withdraw_failed").toString())
      return
    }
    token = tokenInfo.symbol
  }

  const gateway = service().get(token)
  fb.showLoadingBar(true)
  try {
    await gateway.withdraw(receipt)
    ethereumModule.setUserData({ pendingWithdrawal: true })
    fb.showSuccess(i18n.t("feedback_msg.success.transaction_success").toString())
  } catch (err) {
    let sendToSentry = true
    // NOTE remove this when BSC supports websocket
    if (isBCWallet(context.rootState.ethereum.wallet) &&
      (err as any).message.includes("Failed to subscribe to new newBlockHeaders to confirm the transaction receipts")) {
      fb.showSuccess(i18n.t("feedback_msg.success.transaction_success").toString())
      sendToSentry = false
    } else if ("imToken" in window) {
      // imToken throws even if transaction succeeds
      console.log("imToken error", err, (err as any).hash, "x", (err as any).transactionHash)
    } else {
      console.error(err)
      fb.showError(i18n.t("feedback_msg.error.withdraw_failed").toString())
    }
    if (sendToSentry) {
      Sentry.withScope((scope) => {
        scope.setExtra("ethereumWithdraw", {
          receipt: JSON.stringify({
            tokenOwner: receipt.tokenOwner.local.toString(),
            tokenContract: receipt.tokenContract!.local.toString(),
            tokenId: (receipt.tokenId || "").toString(),
            tokenAmount: receipt.tokenAmount!.toString(),
            signatures: receipt.oracleSignature,
          }),
        })
        Sentry.captureException(err)
      })
    }
  } finally {
    ethereumModule.setUserData({ pendingWithdrawal: false })
    fb.showLoadingBar(false)
  }
}

export async function refreshEthereumHistory(context: ActionContext) {
  // clear history
  ethereumModule.clearHistory()
  const ethereum = context.rootState.ethereum
  const { loomGateway, mainGateway } = service()
  const address = ethereum.address
  const coins = Object.keys(context.rootState.ethereum.coins)
  const promises = coins.map((symbol) => {
    switch (symbol) {
      case PlasmaTokenKind.ETH:
        if (mainGateway !== null) {
          return logEvents(address, mainGateway, symbol, "ETHReceived", "TokenWithdrawn")
        }
      case PlasmaTokenKind.LOOMCOIN:
        return logEvents(address, loomGateway, symbol, "LoomCoinReceived", "TokenWithdrawn")
      default:
        if (mainGateway !== null) {
          return logEvents(address, mainGateway, symbol, "ERC20Received", "TokenWithdrawn")
        }
    }
  })
  await Promise.all(promises)
  ethereum.history.sort((a, b) => b.blockNumber - a.blockNumber)
}

async function logEvents(address, gateway, symbol, depositEvent, withdrawEvent) {
  const cached = ethereumModule.state.history
  let fromBlock = cached.length ? cached[0].blockNumber : 0
  let toBlock: string | number = "latest"
  // BSC max query size is 5000
  if (ethereumModule.state.networkName.startsWith("bsc-")) {
    fromBlock = Math.max(fromBlock, ethereumModule.state.blockNumber - 5000)
    // state.blockNumber is not garanteed to be latest,
    // to make sure we don't go over 5000 usedstate.blockNumber as toBlock
    toBlock = ethereumModule.state.blockNumber
  }
  const range = { fromBlock, toBlock }
  const logToHistory = (items, type, token, valueField) => {
    log("logToHistory", type, token, items)
    for (const item of items) {
      const entry = Object.freeze({
        type,
        blockNumber: item.blockNumber,
        transactionHash: item.transactionHash,
        amount: new BN(item.returnValues[valueField]),
        token: token || "other",
        decimals: tokenService.get(token)!.decimals,
      })
      ethereumModule.state.history.push(entry)
    }
  }
  const p1 = gateway
    // @ts-ignore
    .getPastEvents(depositEvent, { filter: { from: address }, ...range })
    .then((results) => logToHistory(results, depositEvent, symbol, "amount"))
    .catch((e) => console.error("error loading LoomCoinReceived", e.message))

  const p2 = gateway
    // @ts-ignore
    .getPastEvents(withdrawEvent, { filter: { owner: address }, ...range })
    .then((results) => logToHistory(results, withdrawEvent, symbol, "value"))
    .catch((e) => console.error("error loading TokenWithdrawn", e.message))

  await Promise.all(([p1, p2]))
}

/**
 * WARNING: keep order the same as {loom-js/dist/contracts/transfer-gateway/GatewayTokenKind}
 */
const WithdrawalPrefixes = [
  "\x0eWithdraw ETH:\n",
  "\x10Withdraw ERC20:\n",
  "\x11Withdraw ERC721:\n",
  "\x12Withdraw ERC721X:\n",
  "\x10Withdraw ERC20:\n",
]

async function decodeSig(
  receipt: IWithdrawalReceipt,
  gatewayContract: Contract,
  ethereumVMC: ValidatorManagerContract,
) {
  const hash = await createWithdrawalHash(receipt, gatewayContract)
  const validators = await ethereumVMC!.methods.getValidators().call()
  const { vs, rs, ss, valIndexes } = parseSigs(
    CryptoUtils.bytesToHexAddr(receipt.oracleSignature),
    hash,
    validators,
  )
  return {
    ...receipt,
    decodedSig: { vs, rs, ss, valIndexes },
  } as WithdrawalReceiptsV2
}

/**
 *
 * @param receipt withdrawal receipt
 * @param gatewayContract {GatewayABIv2} for loom {Gateway} for the rest
 */
async function createWithdrawalHash(
  receipt: IWithdrawalReceipt,
  gatewayContract: Contract,
): Promise<string> {
  const ethAddress = receipt.tokenOwner.local.toString()
  const tokenAddress = receipt.tokenContract!.local.toString()
  // ETH: gatewayAddress ?
  const gatewayAddress = gatewayContract.options.address
  const amount = receipt.value.isZero() ? receipt.tokenAmount!.toString() : receipt.value.toString()
  const amountHashed = receipt.tokenKind === TransferGatewayTokenKind.ETH
    ? ethers.utils.solidityKeccak256(
      ["uint256"],
      [amount],
    ) : ethers.utils.solidityKeccak256(
      ["uint256", "address"],
      [amount, tokenAddress],
    )
  const prefix = WithdrawalPrefixes[receipt.tokenKind]
  if (prefix === undefined) {
    throw new Error("Don't know prefix for token kind " + receipt.tokenKind)
  }
  const nonce = await gatewayContract.methods.nonces(ethAddress).call()
  log("hash", [prefix, ethAddress, nonce, gatewayAddress, amountHashed])
  return ethers.utils.solidityKeccak256(
    ["string", "address", "uint256", "address", "bytes32"],
    [prefix, ethAddress, nonce, gatewayAddress, amountHashed],
  )
}
