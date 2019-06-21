import BN from "bn.js"

import Web3 from "web3"
import { Contract } from "web3-eth-contract"

import { Gateway } from "./contracts/Gateway"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import ERC20GatewayABI_v2 from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2.json"
import GatewayABI from "loom-js/dist/mainnet-contracts/Gateway.json"

import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"
import { ethereumModule } from "../ethereum"
import { feedbackModule as fb } from "@/feedback/store"

import { ActionContext, WithdrawalReceiptsV2 } from "./types"
// XXX
import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import ValidatorManagerContractABI from "loom-js/dist/mainnet-contracts/ValidatorManagerContract.json"
import { CryptoUtils } from "loom-js"
import { parseSigs } from "loom-js/dist/helpers"
import { ethers } from "ethers"
import { AbiItem } from "web3-utils"

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
    private vmc: ValidatorManagerContract,
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
    const { decodedSig } = await decodeSig(receipt, this.contract, this.vmc)
    const { valIndexes, vs, ss, rs } = decodedSig
    const amount = receipt.tokenAmount!.toString()
    const localAddress = receipt.tokenOwner.local.toString()
    const result = this.contract.methods
      .withdrawERC20(amount, this.tokenAddress, valIndexes, vs, rs, ss)
      .send({ from: localAddress })
    result.then((tx) => {
      localStorage.setItem("pendingWithdrawal", JSON.stringify(false))
      localStorage.setItem(
        "latestWithdrawalBlock",
        JSON.stringify(tx.blockNumber),
      )
    })
    return result
  }
}

/**
 * adapts eth deposit/withdraw calls to EthereumGatewayAdapter
 */
class EthGatewayAdapter implements EthereumGatewayAdapter {
  token = "ETH"

  constructor(
    private vmc: ValidatorManagerContract,
    readonly contract: Gateway,
    readonly tokenAddress: string,
    readonly web3: Web3,
  ) { }

  deposit(amount: BN) {
    this.web3.eth.sendTransaction({
      // @ts-ignore
      to: this.contract.address,
      value: amount.toString(),
    })
  }

  async withdraw(receipt: IWithdrawalReceipt) {
    const { decodedSig } = await decodeSig(receipt, this.contract, this.vmc)
    const { valIndexes, vs, ss, rs } = decodedSig
    const amount = receipt.tokenAmount!
    return this.contract.methods.withdrawETH(
      amount.toString(),
      valIndexes,
      vs,
      ss,
      rs,
    )
  }
}

let instance: EthereumGateways | null = null
export async function init(
  web3: Web3,
  addresses: { mainGateway: string; loomGateway: string },
) {
  const loomGateway = new web3.eth.Contract(
    ERC20GatewayABI_v2 as AbiItem[],
    addresses.loomGateway,
  )
  // TODO: Move to config
  const mainGateway = new web3.eth.Contract(
    GatewayABI as AbiItem[],
    addresses.mainGateway, // "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
  )
  const vmcAddress = await loomGateway.methods.vmc().call()
  const vmcContract = new web3.eth.Contract(
    ValidatorManagerContractABI,
    vmcAddress,
  )

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
  constructor(
    readonly mainGateway: Gateway,
    readonly loomGateway: ERC20Gateway_v2,
    readonly vmc: ValidatorManagerContract,
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
  const approvalAmount = await ethereumModule.allowance({
    symbol,
    // @ts-ignore
    spender: gateway.contract._address,
  })
  if (weiAmount.gt(approvalAmount)) {
    await ethereumModule.approve({
      // @ts-ignore
      to: gateway.contract._address,
      ...funds,
    })
  }
  fb.requireConfirmation({
    title: "Complete deposit",
    message: "Please sign click confirm to complete your deposit.",
    onConfirm: async () => {
      try {
        await gateway.deposit(
          funds.weiAmount,
          context.rootState.ethereum.address,
        )
        fb.showAlert({
          title: "Deposit successful",
          message: "components.gateway.deposit.confirmed",
        })
      } catch (err) {
        fb.showAlert({
          title: "Deposit failed",
          message: "components.gateway.deposit.failure",
        })
      }
    },
  })
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export async function ethereumWithdraw(context: ActionContext, token: string) {
  const receipt = context.state.withdrawalReceipts
  const gateway = service().get(token)
  if (receipt === null || receipt === undefined) {
    throw new Error("no withdraw receipt in state for " + token)
  }
  await gateway.withdraw(receipt)
}

export async function refreshEthereumHistory(context: ActionContext) {
  const ethereum = context.rootState.ethereum
  const cached = ethereum.history
  const { mainGateway, loomGateway } = service()

  const fromBlock = cached.length ? cached[0].blockNumber : 0
  const depositFilter = {
    filter: {
      from: ethereum.address,
    },
    fromBlock,
    // @ts-ignore
    toBlock: "latest",
  }

  // @ts-ignore
  loomGateway.getPastEvents("ERC20Received", depositFilter, (e, results) => {
    const entries = results.reverse().map((entry) => ({
      event: "ERC20Received",
      blockNumber: entry.blockNumber,
      transactionHash: entry.transactionHash,
      amount: new BN(entry.returnValues.amount),
      token: "LOOM",
    }))
    ethereum.history.push(...entries)
    console.log(ethereum.history)
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
  // @ts-ignore
  const gatewayAddress = gatewayContract._address
  const amount = receipt.tokenAmount!.toString()
  const amountHashed = ethers.utils.solidityKeccak256(
    ["uint256", "address"],
    [amount, tokenAddress],
  )

  const prefix = WithdrawalPrefixes[receipt.tokenKind]
  if (prefix === undefined) {
    throw new Error("Don't know prefix for token kind " + receipt.tokenKind)
  }

  const nonce = await gatewayContract.methods.nonces(ethAddress).call()
  return ethers.utils.solidityKeccak256(
    ["string", "address", "uint256", "address", "bytes32"],
    [prefix, ethAddress, nonce, gatewayAddress, amountHashed],
  )
}

const example = { address: "0xEA319a0Ea64f482060032b4BE8d9d3F7232c1214", blockHash: "0x65a1e36ad1e50963bb18d8365caa2ecd1e3921a6d58fdf3720ccc41ca4abb005", blockNumber: 4420430, logIndex: 5, removed: false, transactionHash: "0xa4c077281a5e979dfdd116483f92b5fe0535bff53d222e9477c1464c2c399759", transactionIndex: 4, id: "log_9d144686", returnValues: { 0: "0x611e9CDFf7a7635C87EE5D6F7693Dc5C5018B5d2", 1: "10000000000000000000", 2: "0x425532c6a0b0327bbD702AD7a1aB618b1E86289D", from: "0x611e9CDFf7a7635C87EE5D6F7693Dc5C5018B5d2", amount: "10000000000000000000", contractAddress: "0x425532c6a0b0327bbD702AD7a1aB618b1E86289D" }, event: "ERC20Received", signature: "0xa13cf347fb36122550e414f6fd1a0c2e490cff76331c4dcc20f760891ecca12a", raw: { data: "0x000000000000000000000000611e9cdff7a7635c87ee5d6f7693dc5c5018b5d20000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000425532c6a0b0327bbd702ad7a1ab618b1e86289d", topics: ["0xa13cf347fb36122550e414f6fd1a0c2e490cff76331c4dcc20f760891ecca12a"] } }
