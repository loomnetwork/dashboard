/**
 * @module dpos-dashboard.plasma
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"
import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20"
import { timer } from "rxjs"
import { PlasmaState, HasPlasmaState, TransferRequest, PlasmaSigner, CardDetail, PackDetail } from "./types"
import { Client, Address, LocalAddress } from "loom-js"
import BN from "bn.js"
import { TokenSymbol } from "../ethereum/types"
import * as getters from "./getters"
import * as mutations from "./mutations"
import { noop } from "vue-class-component/lib/util"
import { DashboardState } from "@/types"
import { getCardByTokenId, formatFromLoomAddress } from "@/utils"
import { PACKS_NAME } from "../plasmaPlugin"
import { CommonTypedStore } from "../common"
import { DPOSTypedStore } from "../dpos-old"
import { getCardByTokenId } from "@/utils"
import configs from "@/envs"
import { setupProtocolsFromEndpoint } from "loom-js/dist/helpers"
import debug from "debug"

const log = debug("plasma")


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
    packsContract: {},
    cardContract: null,
    cardBalance: [],
    packBalance: [],
    cardToTransferSelected: null,
    packToTransferSelected: null,
    allCardsToTransferSelected: {
      edition: "none",
      cards: [],
      amount: 0,
    },
}

const builder = getStoreBuilder<DashboardState>().module("plasma", initialState)
const stateGetter = builder.state()
declare type ActionContext = BareActionContext<PlasmaState, DashboardState>

export const plasmaModule = {
    get state() { return stateGetter() },

    getAddress: builder.read(getAddress),

    changeIdentity: builder.dispatch(changeIdentity),
    getCallerAddress: builder.dispatch(getCallerAddress),
    refreshBalance: builder.dispatch(refreshBalance),
    approve: builder.dispatch(approveTransfer),
    transfer: builder.dispatch(transferTokens),

    // assets
    getCardInstance: builder.read(getters.getCardInstance),
    checkCardBalance: builder.dispatch(checkCardBalance),
    checkPackBalance: builder.dispatch(checkPackBalance),
    transferPacks: builder.dispatch(transferPacks),
    transferCards: builder.dispatch(transferCards),
    // mutation
    setPacksContract: builder.commit(mutations.setPacksContract),
    setCardContract:  builder.commit(mutations.setCardContract),
    setCardBalance: builder.commit(mutations.setCardBalance),
    setPackBalance: builder.commit(mutations.setPackBalance),
    setCardToTransferSelected: builder.commit(mutations.setCardToTransferSelected),
    setAllCardsToTransferSelected: builder.commit(mutations.setAllCardsToTransferSelected),
    setPackToTransferSelected: builder.commit(mutations.setPackToTransferSelected),

  }

async function checkCardBalance(context: ActionContext) {
    const dposUser = await context.rootState.DPOS.dposUser
    const account = dposUser!.loomAddress.local.toString()
    const ethAddr = dposUser!.ethAddress
    const tokens = await context.state.cardContract!.methods
                .tokensOwned(account)
                .call({ from: ethAddr })
    const cards: CardDetail[] = []
    tokens.indexes.forEach((id: string, i: number) => {
      const card = getCardByTokenId(id)
      card.amount = parseInt(tokens.balances[i], 10)
      cards.push(card)
    })
    plasmaModule.setCardBalance(cards)

}

async function checkPackBalance(context: ActionContext) {
  const dposUser = await context.rootState.DPOS.dposUser
  const account = dposUser!.loomAddress.local.toString()
  const ethAddr = dposUser!.ethAddress
  const packs: PackDetail[] = []
  PACKS_NAME.forEach(async (type) => {
    const amount = await context.state.packsContract[type].methods
            .balanceOf(account)
            .call({ from: ethAddr })
    const pack =  {type, amount}
    packs.push(pack)
  })
  plasmaModule.setPackBalance(packs)

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

async function transferPacks(
  context: ActionContext,
  payload: {
    packType: string,
    amount: number,
    destinationDappchainAddress: string}) {
  try {
    DPOSTypedStore.setShowLoadingSpinner(true)
    const dposUser = await context.rootState.DPOS.dposUser
    const ethAddress = dposUser!.ethAddress
    const receiver = formatFromLoomAddress(payload.destinationDappchainAddress)
    const result = await context.state.packsContract[payload.packType].methods
    .transfer(receiver, payload.amount)
    .send({ from: ethAddress })
    CommonTypedStore.setSuccessMsg({
      msg: `Transferring packs success. tx-hash: ${result.transactionHash}.`,
      forever: true})
    await plasmaModule.checkPackBalance()
    DPOSTypedStore.setShowLoadingSpinner(false)
    return result
  } catch (error) {
    DPOSTypedStore.setShowLoadingSpinner(false)
    const msg = plasmaErrorMessage(error.message)
    CommonTypedStore.setErrorMsg(`Error Transferring packs: ${msg}`)
    throw error
  }
}

async function transferCards(
  context: ActionContext,
  payload: {
    cardIds: string[],
    amounts: number[],
    destinationDappchainAddress: string}) {
  try {
    DPOSTypedStore.setShowLoadingSpinner(true)
    const dposUser = await context.rootState.DPOS.dposUser
    const dappchainAddress = dposUser!.loomAddress.local.toString()
    const ethAddress = dposUser!.ethAddress
    const receiver = formatFromLoomAddress(payload.destinationDappchainAddress)
    const result = await context.state.cardContract!.methods.batchTransferFrom(
    dappchainAddress,
    receiver,
    payload.cardIds,
    payload.amounts)
    .send({ from: ethAddress })
    DPOSTypedStore.setShowLoadingSpinner(false)
    CommonTypedStore.setSuccessMsg({
      msg: `Transferring cards success. tx-hash: ${result.transactionHash}.`,
      forever: true})
    await plasmaModule.checkCardBalance()
    return result
  } catch (error) {
    DPOSTypedStore.setShowLoadingSpinner(false)
    const msg = plasmaErrorMessage(error.message)
    CommonTypedStore.setErrorMsg(`Error Transferring cards: ${msg}`)
    throw error
  }
}

function plasmaErrorMessage(errorMsg: string) {
  if (errorMsg.includes("invalid address")) {
    return "Invalid address. Please provide receiver's Loom address."
  } else if (errorMsg.includes("User denied message signature")) {
    return "Transaction was denied."
  } else if (errorMsg.includes("invalid number value")) {
    return "Invalid amount. Please provide amount correctly."
  } else {
    return errorMsg
  }
}

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
    const coins = context.state.coins
    const addr = new Address("default", LocalAddress.fromHexString(context.state.address))
    coins[token].loading = true
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
    coins[token].loading = false
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
