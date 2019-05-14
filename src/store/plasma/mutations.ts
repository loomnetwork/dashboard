import { PlasmaState } from './types';
import Contract from 'web3/eth/contract';

export function setCardContract(state: PlasmaState, payload: {name: string, contract: Contract}) {
    state.cardContract[payload.name] = payload.contract
}