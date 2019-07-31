import { ethers } from "ethers"

import { WalletType } from "../types"

import Fortmatic from 'fortmatic';
// Works for web3 1.0 and pre-1.0 versions
import Web3 from 'web3';

export const FortmaticAdapter: WalletType = {
  id: "fortmatic",
  name: "Fortmatic",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  detect() {
    return true
  },
  async createProvider() {
    // dappID and network will be change later
    const fm = new Fortmatic("pk_test_58DB7D96C460470B", "rinkeby")
    return fm.getProvider()
  },
}
