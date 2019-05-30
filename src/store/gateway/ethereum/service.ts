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
