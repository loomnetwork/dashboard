/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"

import { PlasmaState, CardDetail, PackDetail, TierID } from "./types"
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
import { CryptoUtils, LocalAddress, Contract, Address } from "loom-js"
import { UserDeployerWhitelist } from "loom-js/dist/contracts"

const initialState: PlasmaState = {
    // not state but...
    client: null,
    balances: {
        [TokenSymbol.LOOM]: new BN("0"),
        [TokenSymbol.ETH]: new BN("0"),
        [TokenSymbol.BNB]: new BN("0"),
    },
    packsContract: {},
    cardContract: null,
    cardBalance: [],
    packBalance: [],
    cardToTransferSelected: {},
    packToTransferSelected: {},
    allCardsToTransferSelected: {
      edition: "none",
      cards: [],
      amount: 0,
    },
    userDeployerWhitelist: null,
    userDeployersAddress: [],
}

const builder = getStoreBuilder<DashboardState>().module("plasma", initialState)
const stateGetter = builder.state()
declare type ActionContext = BareActionContext<PlasmaState, DashboardState>

export const plasmaModule = {
    get state() { return stateGetter() },

    // Getters
    getCardInstance: builder.read(getters.getCardInstance),

    // actions
    checkCardBalance: builder.dispatch(checkCardBalance),
    checkPackBalance: builder.dispatch(checkPackBalance),
    transferPacks: builder.dispatch(transferPacks),
    transferCards: builder.dispatch(transferCards),
    getPublicAddressFromPrivateKeyUint8Array: builder.dispatch(getPublicAddressFromPrivateKeyUint8Array),

    // mutation
    setPacksContract: builder.commit(mutations.setPacksContract),
    setCardContract:  builder.commit(mutations.setCardContract),
    setCardBalance: builder.commit(mutations.setCardBalance),
    setPackBalance: builder.commit(mutations.setPackBalance),
    setCardToTransferSelected: builder.commit(mutations.setCardToTransferSelected),
    setAllCardsToTransferSelected: builder.commit(mutations.setAllCardsToTransferSelected),
    setPackToTransferSelected: builder.commit(mutations.setPackToTransferSelected),

    // developer-deploy
    setUserDeployerWhitelist: builder.commit(mutations.setUserDeployerWhitelist),
    setUserDeployersAddress: builder.commit(mutations.setUserDeployersAddress),
    createUserDeployerWhitelistAsync: builder.dispatch(createUserDeployerWhitelistAsync),
    addDeployerAsync: builder.dispatch(addDeployerAsync),
    getDeployersAsync: builder.dispatch(getDeployersAsync),
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

async function getPublicAddressFromPrivateKeyUint8Array(context: ActionContext, payload: { privateKey: Uint8Array }) {
  const publicKeyUint8Array = await CryptoUtils.publicKeyFromPrivateKey(payload.privateKey)
  const publicAddress = LocalAddress.fromPublicKey(publicKeyUint8Array).toString()
  return publicAddress
}

function createClient() {
    noop()
}

async function createUserDeployerWhitelistAsync(context: ActionContext) {
  const dposUser = await context.rootState.DPOS.dposUser
  const loomAddress = dposUser!.loomAddress
  const account = dposUser!.loomAddress.local.toString()
  console.log("account", account);
  console.log("UserDeployerWhitelist.createAsync",UserDeployerWhitelist.createAsync);
  const userDeployerWhitelist = await UserDeployerWhitelist.createAsync(
    context.rootState.DPOS.client!,
    loomAddress)
  plasmaModule.setUserDeployerWhitelist(userDeployerWhitelist)
}

// TODO: update this if we have more tier
async function addDeployerAsync(context: ActionContext, payload: {deployer: string}) {
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const deployAddress = new Address(
    context.state.client!.chainId,
    LocalAddress.fromHexString(payload.deployer),
  )
  const result = await userDeployerWhitelist!.addDeployerAsync(deployAddress)
  console.log("result", result)
  await plasmaModule.getDeployersAsync()
}

async function getDeployersAsync(context: ActionContext) {
  const dposUser = await context.rootState.DPOS.dposUser
  const loomAddress = dposUser!.loomAddress
  const userDeployerWhitelist = context.state.userDeployerWhitelist
  const result = await userDeployerWhitelist!.getDeployersAsync(loomAddress)
  console.log("result", result)
  plasmaModule.setUserDeployersAddress(result)
}
