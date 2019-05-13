import WalletInterface from "./WalletInterface"

class HDWalletInterface extends WalletInterface {
  constructor(
    readonly path,
    pubkey,
    readonly isHardware: boolean,
    identifier: string,
    readonly txSigner,
    readonly msgSigner,
  ) {
    super(pubkey, true, identifier)
  }

  signTransaction(txParams) {
    return super.signTransaction(txParams, this.txSigner)
  }

  signMessage(msg) {
    return super.signMessage(msg, this.msgSigner)
  }
}
export default HDWalletInterface
