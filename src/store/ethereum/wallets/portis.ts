import { ethers } from "ethers"

import { WalletType } from "../types"
import { provider } from "web3-providers"
import { feedbackModule } from "@/feedback/store"
import { ethereumModule } from ".."
import { Web3Provider } from "ethers/providers";

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
  createProvider() {
    initPortis()
    // @ts-ignore
    console.log("window web3", window.web3.getCurrentProvider)
    // @ts-ignore
    return window.web3.getCurrentProvider
  },
}

async function initPortis() {
  try {
    const portis = new Portis('10589118-6329-43a0-818c-93800c206786', 'rinkeby')
    await portis.showPortis()
    const web3 = new Web3(portis.provider)
    let userAddress = web3.currentProvider.enable()
    console.log("userAddress", userAddress)
    // @ts-ignore
    // let userAddress = await web3.currentProvider.enable()
    // console.log("userAddress", userAddress)
    // web3.eth.sendTransaction({
    //   // From address will automatically be replaced by the address of current user
    //   from: '0x0000000000000000000000000000000000000000',
    //   to: "0x91A31A1C5197DD101e91B0747B02560f41E2f532",
    //   value: web3.utils.toWei(0.02, 'ether')
    // })
  } catch (e) {
    console.log("ERROR", e)
  }
}