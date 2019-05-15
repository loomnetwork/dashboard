/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder, BareActionContext } from "vuex-typex"

import { PlasmaState, HasPlasmaState } from "./types"
import { Client } from "loom-js"
import BN from "bn.js"
import { createDefaultClient } from "loom-js/dist/helpers";
import { TokenSymbol } from "../ethereum/types";
import MigratedZBGCardJSON from "@/contracts/MigratedZBGCard.json"
import * as getters from "./getters"
import * as mutations from "./mutations"
import { getCachedEvents } from '../dpos-old/getters';
import { noop } from "vue-class-component/lib/util"
import Contract from 'web3/eth/contract';
import { DashboardState } from '@/types';

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
    packsBalances: {},
}

const builder = getStoreBuilder<DashboardState>().module("plasma", initialState)
const stateGetter = builder.state()
declare type ActionContext = BareActionContext<PlasmaState, DashboardState>

export const plasmaModule = {
    get state() { return stateGetter() },

    // Getters
    getCardInstance: builder.read(getters.getCardInstance),

    // actions
    checkCardsBalances: builder.dispatch(checkCardsBalances),
    checkPacksBalances: builder.dispatch(checkPacksBalances),

    // mutation
    setPacksContract: builder.commit(mutations.setPacksContract),
    setCardContract:  builder.commit(mutations.setCardContract),
    setCardBalance: builder.commit(mutations.setCardBalance),
    setPackBalance: builder.commit(mutations.setPackBalance),
  }

async function checkCardsBalances(context: ActionContext) {
    const dposUser = await context.rootState.DPOS.dposUser
    console.log("--------------------------");
    console.log("dposUser", dposUser!);
    console.log("dposUser!.loomAddress.toString()", dposUser!.loomAddress.toString()!);
    console.log("--------------------------");
    const tokens = await context.state.cardContract!.methods
                .tokensOwned(dposUser!.loomAddress.toString())
                .call({ from: dposUser!.loomAddress.toString() })
    const cards = context.state.cardBalance
    tokens.indexes.forEach((id: string, i: number) => {
      cards.push({id, amount: parseInt(tokens.balances[i], 10)})
    })
    plasmaModule.setCardBalance(cards)
}

async function checkPacksBalances(context: ActionContext, payload: string) {
  const account = context.rootState.DPOS.account
  const amount = await context.state.packsContract[payload].methods
          .balanceOf(account)
          .call({ from: account })
  plasmaModule.setPackBalance({packType: payload, balance: amount})
}

function createClient() {
    noop()
}
