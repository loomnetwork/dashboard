/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"

import { DashboardState } from "@/types"

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

const log = debug("dboard.ethereum")

declare type ActionContext = BareActionContext<EthereumState, HasEthereumState>

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
        loom: "",
        bnb: "",
        usdc: "",
    },
    balances: {
        eth: null,
        loom: null,
    },
}

const builder = getStoreBuilder<HasEthereumState>().module("ethereum", initialState)
const stateGetter = builder.state()

// vuex typedd module
export const ethereumModule = {

    get state() { return stateGetter() },

    refreshBalance: builder.dispatch(refreshBalance),
    approve: builder.dispatch(approve),
    transfer: builder.dispatch(transfer),

    setWalletType: builder.dispatch(setWalletType),

}

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<string, ERC20> = new Map()

async function setWalletType(context: ActionContext, walletType: string) {
    const {state} = context
    const wallet = wallets.get(walletType)
    if (wallet === undefined) {
        // tell user error
        console.error("unsuported wallet type " + walletType)
        return
    }
    state.walletType = walletType
    if (wallet.isMultiAccount === false) {
        const provider = await wallet.createProvider()
        state.provider = provider
        // todo manage if no signer (readonly)
        state.signer = provider.getSigner()
        state.address = (await provider.getSigner().getAddress()).toLocaleLowerCase()
        debugger
        log("wallet set")
    }

}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function refreshBalance(context: ActionContext, symbol: string) {
    return timer(2000).toPromise()
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approve(context: ActionContext,  payload: TransferRequest) {
    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transfer(context: ActionContext, payload: TransferRequest) {
    return timer(2000).toPromise()
}

export function allowance(context: ActionContext, spender: string) {
    return timer(2000).toPromise().then(() => new BN("0"))
}

