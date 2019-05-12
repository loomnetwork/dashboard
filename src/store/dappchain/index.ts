// import { getStoreBuilder } from "vuex-typex"
// import { DashboardState, DappchainState } from "@/types"
// import * as mutations from "./mutations"
// import { DPOS3, AddressMapper } from "loom-js/dist/contracts"
// import { BareActionContext } from "vuex-typex"
// import {
//   CryptoUtils,
//   Client,
//   createJSONRPCClient,
//   NonceTxMiddleware,
//   SignedTxMiddleware,
//   LocalAddress,
//   Address,
//   DPOSUserV3,
//   getMetamaskSigner,
//   EthersSigner,
//   SignedEthTxMiddleware,
// } from "loom-js"
// import { formatToCrypto, getDomainType } from "@/utils"
// import { createDefaultClient } from "loom-js/dist/helpers"

// import Web3 from "web3"
// import BN from "bn.js"
// import debug from "debug"

// import { DPOSTypedStore } from "../dpos-old"
// import { CommonTypedStore } from "../common"

// debug.enable("dashboard.dapp")
// const log = debug("dashboard.dapp")

// const DPOS = DPOS3

// function defaultState(): DappchainState {
//   return {
//     web3: undefined,
//     account: undefined,
//     localAddress: undefined,
//     count: 0,
//     chainUrls: networks,
//     networkId: getNetworkId(),
//     currentChain: getCurrentChain(),
//     dAppChainClient: null,
//     metamaskStatus: undefined,
//     metamaskError: undefined,
//     validators: [],
//   }
// }

// const builder = getStoreBuilder<DashboardState>().module(
//   "DappChain",
//   defaultState(),
// )
// const stateGetter = builder.state()

// const DappChainTypedModule = {
//   get state() {
//     return stateGetter()
//   },

//   // actions

// }

// const DappChainStore = builder.vuexModule()

// // shorthand for action context
// declare type ActionContext = BareActionContext<DappchainState, DashboardState>

// async function requireDposUser(ctx: ActionContext) {
//   if (!ctx.rootState.DPOS.dposUser) {
//     throw new Error("Expected dposUser to be initialized")
//   }
//   return await ctx.rootState.DPOS.dposUser
// }

// // typed module and plain vuex store
// export { DappChainTypedModule, DappChainStore }
