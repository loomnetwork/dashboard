import { PlasmaState, CardBalance } from './types';
import Contract from 'web3/eth/contract';
import { MigratedZBGCard } from '@/contracts/types/web3-contracts/MigratedZBGCard';

export function setPacksContract(state: PlasmaState, payload: {name: string, contract: Contract}) {
    state.packsContract[payload.name] = payload.contract
}

export function setCardContract(state: PlasmaState, payload: MigratedZBGCard) {
    console.log("set.......setCardContract.....");
    state.cardContract = payload
}

export function setCardBalance(state: PlasmaState, payload: CardBalance[]) {
    console.log("set.......setCardBalance.....");
    state.cardBalance = payload
}

export function setPackBalance(state: PlasmaState, payload: {packType: string, balance: number}) {
    console.log("set.......setPackBalances.....");
    state.packBalance[payload.packType] = payload.balance
}