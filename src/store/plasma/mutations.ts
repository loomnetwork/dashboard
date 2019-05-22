import { PlasmaState, CardDetail, PackDetail } from './types';
import Contract from 'web3/eth/contract';
import { MigratedZBGCard } from '@/contracts/types/web3-contracts/MigratedZBGCard';

export function setPacksContract(state: PlasmaState, payload: {name: string, contract: Contract}) {
    state.packsContract[payload.name] = payload.contract
}

export function setCardContract(state: PlasmaState, payload: MigratedZBGCard) {
    state.cardContract = payload
}

export function setCardBalance(state: PlasmaState, payload: CardDetail[]) {
    state.cardBalance = payload
}

export function setPackBalance(state: PlasmaState, payload: PackDetail[]) {
    state.packBalance = payload
}

export function setCardToTransferSelected(state: PlasmaState, payload: CardDetail) {
    state.cardToTransferSelected = payload
}

export function setPackToTransferSelected(state: PlasmaState, payload: {type: string, amount: number}) {
    state.packToTransferSelected = payload
}

export function setAllCardsToTransferSelected(
    state: PlasmaState,
    payload: {
        edition: string,
        cards: CardDetail[],
        amount: number,
    }) {
    state.allCardsToTransferSelected = payload
}
