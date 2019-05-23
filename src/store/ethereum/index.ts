/**
 * @module dpos-dashboard.ethereum
 */

import { getStoreBuilder } from "vuex-typex"

import { DashboardState, Transfer } from "@/types"

import { EthereumState, HasEthereumState, WalletType } from "./types"

import * as mutations from "./mutations"

import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import BN from "bn.js"
import { BareActionContext } from "vuex-typex"
import { TransferRequest } from "../plasma/types"
import { MetaMaskAdapter } from "./wallets/metamask"
import { LedgerAdapter } from "./wallets/ledger"
import { JsonRpcProvider } from "ethers/providers"
import debug from "debug"
import { ParamType } from "ethers/utils"
import { Contract } from "ethers"

const log = debug("dboard.ethereum")

declare type ActionContext = BareActionContext<EthereumState, HasEthereumState>

const ERC20ABIs: ParamType[] = require("loom-js/dist/mainnet-contracts/ERC20.json")
import ERC20ABI from "loom-js/dist/mainnet-contracts/ERC20.json"
import { stat } from "fs"
import { state } from "../common"

const wallets: Map<string, WalletType> = new Map([
    ["metamask", MetaMaskAdapter],
    ["ledger", LedgerAdapter],
])

const initialState: EthereumState = {
    provider: null,
    address: "",
    signer: null,
    walletType: "",
    erc20Addresses: {
        // us1
        loom: "0x425532c6a0b0327bbd702ad7a1ab618b1e86289d",
        bnb: "",
        usdc: "",
    },
    balances: {
        eth: null,
        loom: null,
    },
    loom: {
        contract: null,
        balance: "",
        address: "",
    }
}

const builder = getStoreBuilder<HasEthereumState>().module("ethereum", initialState)
const stateGetter = builder.state()

// vuex typedd module
export const ethereumModule = {

    get state() { return stateGetter() },

    /**
     * UI must not call this
     */
    setBalance: builder.commit(mutations.setBalance),

    refreshBalance: builder.dispatch(refreshBalance),
    approve: builder.dispatch(approve),
    transfer: builder.dispatch(transfer),

    setWalletType: builder.dispatch(setWalletType),
    allowance: builder.dispatch(allowance),

    initERC20: builder.dispatch(initERC20),

}

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<string, ERC20> = new Map()

async function setWalletType(context: ActionContext, walletType: string) {
    const {state} = context
    const wallet = wallets.get(walletType)
    if (wallet === undefined) {
        console.error("unsuported wallet type " + walletType)
        // to do tell the user about the error
        return
    }
    state.walletType = walletType
    if (wallet.isMultiAccount === false) {
        wallet.createProvider()
        .then((provider) => {
            state.provider = provider
            console.log("provider", provider)
            return  provider.getSigner()
        })
        .then((signer) => {
            state.signer = signer
            console.log("signer", signer)
            return signer.getAddress()
        })
        .then((address) => {
            console.log("address", address)
            state.address = address
            log("wallet set")
        })
        .catch((e) => {
            console.error(e)
        })
    }

}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function refreshBalance(context: ActionContext, symbol: string) {
    const contract = erc20Contracts.get(symbol)
    if (!contract) {
        throw new Error("No contract found")
    }
    const ethersBN = await contract.functions.balanceOf(context.state.address)
    console.log("refreshed ", symbol, ethersBN.toString())
    context.state.balances[symbol] = new BN(ethersBN.toString())
}

/**
 * approve amount for ERC20 tokens
 * @param symbol
 * @param tokenAmount
 */
export async function approve(context: ActionContext,  payload: Transfer) {
    const {state, rootState} = context
    const {symbol, tokenAmount, to} = payload
    const contract = erc20Contracts.get(symbol)
    await contract!.functions.approve(to, tokenAmount)
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transfer(context: ActionContext, payload: Transfer) {
    return timer(2000).toPromise()
}

export function allowance(context: ActionContext, payload: {symbol: string, spender: string}) {
    const {symbol, spender} = payload
    const contract = erc20Contracts.get(symbol)
    let allowance = contract!.functions.allowance(
      context.state.address,
      spender,
    )
    return allowance
}

export function initERC20(context: ActionContext, symbol: string) {
    const provider = context.state.provider!
    const contractAddr = context.state.erc20Addresses[symbol]
    debugger
    // @ts-ignore
    const contract = new Contract(contractAddr, ERC20ABI, provider) as ERC20
    erc20Contracts.set(symbol, contract)

    const account = context.state.address
    // out out filters
    const send = contract.filters.Transfer(account, null, null)
    const receive = contract.filters.Transfer(null, account, null)

    const refresh = () => ethereumModule.refreshBalance(symbol)

    ethereumModule.refreshBalance(symbol)
    contract.on(send, refresh)
    contract.on(receive, refresh)

    return contract
}
