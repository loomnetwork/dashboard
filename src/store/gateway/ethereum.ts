import BN from "bn.js"

import Web3 from "web3"

import GatewayABI_v1 from "./contracts/Gateway_v1.json"
import GatewayABI_v2 from "loom-js/dist/mainnet-contracts/Gateway.json"

import ERC20GatewayABI_v1 from "loom-js/dist/mainnet-contracts/ERC20Gateway.json"
import ERC20GatewayABI_v2 from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2.json"

// these are v2 types
import { Gateway } from "./contracts/Gateway"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"

import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"
import { ethereumModule } from "../ethereum"
import { feedbackModule as fb, feedbackModule } from "@/feedback/store"

import { ActionContext, WithdrawalReceiptsV2 } from "./types"
// XXX
import { ValidatorManagerContract } from "./contracts/ValidatorManagerContract"
import ValidatorManagerContractABI from "loom-js/dist/mainnet-contracts/ValidatorManagerContract.json"
import { CryptoUtils } from "loom-js"
import { parseSigs } from "loom-js/dist/helpers"
import { ethers } from "ethers"
import { AbiItem } from "web3-utils"

import debug from "debug"
import { tokenService } from "@/services/TokenService"
import { i18n } from "@/i18n"

const log = debug("dash.gateway.ethereum")

/**
 * each token has specic methods for deposit and withdraw (and specific contract in case of loom coin)
 * EthereumGatewayAdapter is a simple abstraction to make those APIs uniform
 */
interface EthereumGatewayAdapter {
  token: string
  contract: ERC20Gateway_v2 | Gateway

  deposit(amount: BN, address: string)
  withdraw(receipt: IWithdrawalReceipt)
}

class ERC20GatewayAdapter implements EthereumGatewayAdapter {
  constructor(
    private vmc: ValidatorManagerContract | null,
    readonly contract: ERC20Gateway_v2 | Gateway,
    readonly tokenAddress: string,
    readonly token: string,
  ) { }

  deposit(amount: BN, address: string) {
    return (
      this.contract.methods
        .depositERC20(amount.toString(), this.tokenAddress)
        // @ts-ignore
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
    console.assert(
      tokenAddress.toLocaleLowerCase() === receipt.tokenContract.local.toString(),
      "Receipt contract address different from current contract",
      receipt.tokenContract.local.toString(),
      tokenAddress,
    )

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
      // @ts-ignore
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
    readonly contract: Gateway,
    readonly tokenAddress: string,
    readonly web3: Web3,
  ) { }

  async deposit(amount: BN, sender: string) {
    console.log({
      from: sender,
      // @ts-ignore
      to: this.contract._address,
      value: amount.toString(),
    })
    await this.web3.eth.sendTransaction({
      from: sender,
      // @ts-ignore
      to: this.contract._address,
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
      // @ts-ignore
      return this.contract.methods.withdrawETH(amount.toString(), signature)
        .send({ from: localAddress })

    }

  }
}

let instance: EthereumGateways | null = null
export async function init(
  web3: Web3,
  addresses: { mainGateway: string; loomGateway: string },
  multisig: boolean,
) {
  const ERC20GatewayABI: AbiItem[] = multisig ? ERC20GatewayABI_v2 : ERC20GatewayABI_v1
  const GatewayABI: AbiItem[] = multisig ? GatewayABI_v2 : GatewayABI_v1
  // @ts-ignore
  const loomGateway = new web3.eth.Contract(
    ERC20GatewayABI,
    addresses.loomGateway,
  ) as ERC20Gateway_v2
  log("loom gateway initialized")
  // @ts-ignore
  const mainGateway: Gateway = new web3.eth.Contract(
    GatewayABI as AbiItem[],
    addresses.mainGateway,
  )
  log("main gateway initialized")
  let vmcContract: any = null
  if (multisig) {
    const vmcAddress = await loomGateway.methods.vmc().call()
    log("vmc address", vmcAddress)
    vmcContract = new web3.eth.Contract(
      ValidatorManagerContractABI,
      vmcAddress,
    )
    log("vmc initialized")
  } else {
    log("Assuming oracle sig gateways")
  }
  instance = new EthereumGateways(mainGateway, loomGateway, vmcContract, web3)
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
    readonly mainGateway: Gateway,
    readonly loomGateway: ERC20Gateway_v2,
    readonly vmc: ValidatorManagerContract | null,
    readonly web3: Web3,
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
      return
    }
    const { vmc, mainGateway, loomGateway, web3 } = this
    let adapter: EthereumGatewayAdapter
    switch (token) {
      case "ETH":
        adapter = new EthGatewayAdapter(vmc, mainGateway, "", web3)
        break
      case "LOOM":
        adapter = new ERC20GatewayAdapter(vmc, loomGateway, tokenAddress, token)
        break
      default:
        adapter = new ERC20GatewayAdapter(vmc, mainGateway, tokenAddress, token)
        break
    }

    // todo cleanup if already set
    this.adapters.set(token, adapter)
    return adapter
  }
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
    feedbackModule.setTask("ETH deposit")
    feedbackModule.setStep("Depositing ETH")
    try {
      await gateway.deposit(weiAmount, context.rootState.ethereum.address)
      feedbackModule.endTask()
    } catch (e) {
      feedbackModule.endTask()
      if ("imToken" in window) {
        console.log("imToken error", e)
        feedbackModule.showInfo("Please track the transaction on your wallet")
      } else {
        console.error(e)
        feedbackModule.showError("Could not deposit ETH, please make sure you pay enough gas for the transaction.")
      }
    }
    return
  }

  fb.showLoadingBar(true)
  const approvalAmount = await ethereumModule.allowance({
    symbol,
    // @ts-ignore
    spender: gateway.contract._address,
  })
  if (weiAmount.gt(approvalAmount)) {
    try {
      await ethereumModule.approve({
        // @ts-ignore
        to: gateway.contract._address,
        ...funds,
      })
      fb.showLoadingBar(false)
    } catch (err) {
      if ("imToken" in window) {
        console.log("imToken error", err)
        fb.showInfo("Please track deposit approval the transaction on your wallet.")
      } else {
        console.error(err)
        fb.showError("Deposit approval failed.")
      }
      console.log(err)
      fb.showLoadingBar(false)
      return
    }
  }
  fb.requireConfirmation({
    title: "Complete deposit",
    message: "Please sign click confirm to complete your deposit.",
    onConfirm: async () => {
      try {
        fb.showLoadingBar(true)
        await gateway.deposit(
          funds.weiAmount,
          context.rootState.ethereum.address,
        )
        fb.showLoadingBar(false)
        fb.showSuccess(i18n.t("components.gateway.deposit.confirmed").toString())
      } catch (err) {
        fb.showLoadingBar(false)
        if ("imToken" in window) {
          console.log("imToken error", err)
          fb.showInfo("Please track the transaction on your wallet")
        } else {
          console.error(err)
          fb.showError(i18n.t("components.gateway.deposit.failure").toString())
        }
      }
    },
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
  const tokenAddress = receipt.tokenContract.local.toString().toLowerCase()
  let token: string
  // ETH case tokenAddress is gateway address
  if (tokenAddress === context.rootState.ethereum.contracts.mainGateway.toLowerCase()) {
    console.log("eth withdraw")
    token = "ETH"
  } else {
    const tokenInfo = tokenService.tokenFromAddress(tokenAddress, "ethereum")
    if (tokenInfo === null) {
      console.error("token contract address in receipt unknown ", tokenInfo)
      fb.showError("Withdraw failed, please try again or contact support.")
      return
    }
    token = tokenInfo.symbol
  }

  const gateway = service().get(token)
  fb.showLoadingBar(true)
  try {
    localStorage.setItem("pendingWithdrawal", JSON.stringify(true))
    await gateway.withdraw(receipt)
    fb.showSuccess("Withdrawal complete!")
  } catch (err) {
    // imToken throws even if transaction succeeds
    localStorage.setItem("pendingWithdrawal", JSON.stringify(false))
    if ("imToken" in window) {
      console.log("imToken error", err, err.hash, "x", err.transactionHash)
    } else {
      console.log(err)
      fb.showError("Withdraw failed, please try again or contact support.")
    }
  }
  localStorage.setItem("pendingWithdrawal", JSON.stringify(false))
  fb.showLoadingBar(false)
}

export async function refreshEthereumHistory(context: ActionContext) {
  const ethereum = context.rootState.ethereum
  const cached = ethereum.history
  const { mainGateway, loomGateway } = service()

  const fromBlock = cached.length ? cached[0].blockNumber : 0

  const options = {
    filter: {
      from: ethereum.address,
    },
    fromBlock,
    toBlock: "latest",
  }

  // @ts-ignore
  loomGateway.getPastEvents(
    "LoomCoinReceived",
    options,
    (e, results) => {
      const entries = results.reverse().map((entry) => ({
        type: "ERC20Received",
        blockNumber: entry.blockNumber,
        transactionHash: entry.transactionHash,
        amount: new BN(entry.returnValues.value),
        token: "LOOM",
      }))
      ethereum.history.push(...entries)
    })

  // @ts-ignore
  loomGateway.getPastEvents(
    "TokenWithdrawn",
    options,
    (e, results) => {
      console.log(results)
      const entries = results.reverse().map((entry) => ({
        type: "TokenWithdrawn",
        blockNumber: entry.blockNumber,
        transactionHash: entry.transactionHash,
        amount: new BN(entry.returnValues.value),
        token: "LOOM",
      }))
      ethereum.history.push(...entries)
      console.log("ENTRIES", results)
    })

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
  gatewayContract: Gateway | ERC20Gateway_v2,
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
 * @param gatewayContract {ERC20Gateway_v2} for loom {Gateway} for the rest
 */
async function createWithdrawalHash(
  receipt: IWithdrawalReceipt,
  gatewayContract: Gateway | ERC20Gateway_v2,
): Promise<string> {
  const ethAddress = receipt.tokenOwner.local.toString()
  const tokenAddress = receipt.tokenContract.local.toString()
  // ETH: gatewayAddress ?
  // @ts-ignore
  const gatewayAddress = gatewayContract._address
  const amount = receipt.value.isZero() ? receipt.tokenAmount!.toString() : receipt.value.toString()
  const amountHashed = ethers.utils.solidityKeccak256(
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
