/**
 * basically a bunch of wrappers/facades for the contracts calls
 * @module loomrx.ethereum
 * @preferred
 */

import { ethers } from "ethers"

import { WalletType } from "../types"

export const MetaMaskAdapter: WalletType = {
    id: "netamask",
    name: "Metamask",
    detectable: true,
    isMultiAccount: false,
    desktop: true,
    mobile : false,
    detect() {
        return isCurrentApi() || isLegacyApi()
    },
    async createProvider() {
        if (isCurrentApi()) {
            return getCurrentApi()
        } else if (isLegacyApi()) {
            return getLegacyApi()
        }
        throw new Error("no Metamask installation detected")
    },
}

function isLegacyApi() {
    // @ts-ignore
    return "web3" in window && window.web3.currentProvider.isMetamask
}

function isCurrentApi() {
        // @ts-ignore
    return "ethereum" in window && window.ethereum.isMetaMask
}

function getLegacyApi(): ethers.providers.Web3Provider {
    // @ts-ignore
    return new ethers.providers.Web3Provider(window.web3.currentProvider)
}

async function getCurrentApi(): Promise<ethers.providers.Web3Provider> {
    try {
        // @ts-ignore
        await window.ethereum.enable()
        // @ts-ignore
        return new ethers.providers.Web3Provider(window.ethereum)
    } catch (err) {
        throw Error("User denied access to Metamask")
    }
}
