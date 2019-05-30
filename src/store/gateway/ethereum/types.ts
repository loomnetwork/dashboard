import BN from "bn.js"

import Web3 from "web3"
import { Contract } from "web3-eth-contract"

import { Gateway } from "../contracts/Gateway"
import { ERC20Gateway_v2 } from "../contracts/ERC20Gateway_v2"
import ERC20GatewayABI_v2 from "loom-js/dist/mainnet-contracts/ERC20Gateway_v2.json"
import GatewayABI from "loom-js/dist/mainnet-contracts/Gateway.json"

import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"
import { Funds } from "@/types"

import { ValidatorManagerContract } from "loom-js/dist/mainnet-contracts/ValidatorManagerContract"
import { CryptoUtils } from "loom-js"
import { parseSigs } from "loom-js/dist/helpers"
import { ethers } from "ethers"

/**
 * each token has specic methods for deposit and withdraw (and specific contract in case of loom coin)
 * EthereumGatewayAdapter is a simple abstraction to make those APIs uniform
 */
interface EthereumGatewayAdapter {
  token: string
  contract: ERC20Gateway_v2 | Gateway

  deposit(amount: BN)
  withdraw(receipt: IWithdrawalReceipt)
}

class ERC20GatewayAdapter implements EthereumGatewayAdapter {
  constructor(
    private vmc: ValidatorManagerContract,
    readonly contract: ERC20Gateway_v2 | Gateway,
    readonly tokenAddress: string,
    readonly token: string,
  ) {}

  deposit(amount: BN) {
    return this.contract.methods.depositERC20(
      amount.toString(),
      this.tokenAddress,
    )
  }

  async withdraw(receipt: IWithdrawalReceipt) {
    const { decodedSig } = await decodeSig(receipt, this.contract, this.vmc)
    const { valIndexes, vs, ss, rs } = decodedSig
    const amount = receipt.tokenAmount!.toString()
    return this.contract.methods.withdrawERC20(
      amount,
      this.tokenAddress,
      valIndexes,
      vs,
      ss,
      rs,
    )
  }
}

/**
 * adapts eth deposit/withdraw calls to EthereumGatewayAdapter
 */
class EthGatewayAdapter implements EthereumGatewayAdapter {
  token = "eth"

  constructor(
    private vmc: ValidatorManagerContract,
    readonly contract: Gateway,
    readonly tokenAddress: string,
    readonly web3: Web3,
  ) {}

  deposit(amount: BN) {
    this.web3.eth.sendTransaction({
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
