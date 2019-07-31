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
    // if createProvider called
    // @ts-ignore
    return window.web3.currentProvider.isPortis
  },
  async createProvider() {
    // dappID and network will be change later
    const portis = new Portis('10589118-6329-43a0-818c-93800c206786', 'rinkeby')
    // @ts-ignore
    window.web3 = new Web3(portis.provider)
    portis.showPortis()
    // @ts-ignore
    console.log("web3", window.web3)
    // @ts-ignore
    return window.web3
  },
}
