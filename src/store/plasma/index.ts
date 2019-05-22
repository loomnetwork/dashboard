/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"

import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import { PlasmaState, HasPlasmaState, TransferRequest, PlasmaSigner } from "./types"
import { Client, Address, LocalAddress } from "loom-js"
import BN from "bn.js"
import { createDefaultClient, setupProtocolsFromEndpoint } from "loom-js/dist/helpers"
import { TokenSymbol } from "../ethereum/types"
import { noop } from "vue-class-component/lib/util"

import configs from "@/envs"

const initialState: PlasmaState = {
    // not state but...
    client: createClient(configs.us1),
    web3: null,
    provider: null,
    signer: null,
    address: "",
    appKey: {
        private: "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
        public: "",
        address: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
    },
    erc20Addresses: {
        [TokenSymbol.LOOM]: "",
        [TokenSymbol.ETH]: "",
        [TokenSymbol.BNB]: "",
    },
    coins: {
        loom: {
            contract: null,
            balance: new BN("0"),
            loading: false,
        },
        eth: {
            contract: null,
            balance: new BN("0"),
            loading: false,
        },
    },
}

const builder = getStoreBuilder<HasPlasmaState>().module("plasma", initialState)
const stateGetter = builder.state()

export const plasmaModule = {

    get state() { return stateGetter() },

    getAddress: builder.read(getAddress),

    changeIdentity: builder.dispatch(changeIdentity),
    getCallerAddress: builder.dispatch(getCallerAddress),
    refreshBalance: builder.dispatch(refreshBalance),
    approve: builder.dispatch(approveTransfer),
    transfer: builder.dispatch(transferTokens),

}

// getter
function getAddress(state: PlasmaState): Address {
    const chainId = "default"// state.chainId
    return new Address(chainId, LocalAddress.fromHexString(state.address))
}

function createClient(env: {chainId: string, endpoint: string}) {
    const { writer, reader } = setupProtocolsFromEndpoint(env.endpoint)
    return new Client(env.chainId, writer, reader)
}

declare type ActionContext = BareActionContext<PlasmaState, HasPlasmaState>

async function changeIdentity(ctx: ActionContext, id: {signer: PlasmaSigner|null, address: string}) {
    const {signer, address} = id
    ctx.state.address = address
    ctx.state.signer = signer
    // add the conresponding middleware
    if ( signer === null ) {
        // reset client middleware
        ctx.state.client.txMiddleware = []
    } else {
        await signer.configureClient(ctx.state.client)
        ctx.state.address = await signer.getAddress()
    }
}

// getter but async so I guess it's an action according to vuex
async function getCallerAddress(ctx: ActionContext) {
    const state = ctx.state
    let caller: string
    let chainId: string = state.client.chainId
    if (state.signer) {
        caller = await state.signer.getAddress()
        chainId = state.signer.chain
    } else if (state.address) {
        caller = state.address
    } else {
        caller = state.appKey.address
        // todo get plasma chain id from current config
        // as the client might be initialized witg a foreign chain id (or is it?)
    }
    return Address.fromString(`${chainId}:${caller}`)
}

// holds the contracts. We don't need to exposed these on the state
const erc20Contracts: Map<TokenSymbol, ERC20> = new Map()

function getErc20Contract(symbol: string): ERC20 {
    // @ts-ignore
    return null
}

/**
 * deposit from ethereum account to gateway
 * @param symbol
 * @param tokenAmount
 */
export async function refreshBalance(context: ActionContext, token: string) {
    let balance: BN
    const coins = context.state.coins
    const addr = new Address("default", LocalAddress.fromHexString(context.state.address))
    switch (token) {
        case "loom":
            coins.loom.balance = await coins.loom.contract!.getBalanceOfAsync(addr)
            console.log("updateBalance", token, coins.loom.balance  )
            break
        case "eth":
            coins.eth.balance = await coins.eth.contract!.getBalanceOfAsync(addr)
            console.log("updateBalance", token, coins.eth.balance  )
            break
        default:
            // const contract = getErc20Contract(token)
            // balance = await state.erc20[symbol].functions.balanceOf(addr)
            coins[token].balance = new BN("0")
    }
}

/**
 * withdraw from plasma account to gateway
 * @param symbol
 * @param tokenAmount
 */
export function approveTransfer(
    context: ActionContext,
    { symbol, tokenAmount, to }: TransferRequest,
) {

    const balance = context.state.coins[symbol].balance
    const weiAmount = tokenAmount
    if (weiAmount.gt(balance)) {
        throw new Error("approval.balance.low")
    }
    const contract: ERC20 = getErc20Contract(symbol)

    contract.functions.approve(to, weiAmount.toString())

    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
export function transferTokens(
    context: ActionContext,
    payload: {
        symbol: string,
        tokenAmount: BN,
        to: string,
    },
) {
    return timer(2000).toPromise()
}

export function trasfertAsset(context: ActionContext,
                              payload: {
        symbol: string,
        to: string,
    },
) {
    return timer(2000).toPromise()
}
