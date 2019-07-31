import { ethers } from "ethers"

import { WalletType } from "../types"

import Portis from '@portis/web3';
import Web3 from 'web3';

export const PortisAdapter: WalletType = {
  id: "portis",
  name: "Portis",
  detectable: true,
  isMultiAccount: false,
  desktop: true,
  mobile: true,
  detect() {
    return true
  },
  async createProvider() {
    // dappID and network will be change later
    const portis = new Portis('10589118-6329-43a0-818c-93800c206786', 'rinkeby')
    portis.showPortis()
    return new Promise((resolve, reject) => {
      portis.onLogin(() => resolve(portis.provider))
    })
  },
}
