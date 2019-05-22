import { PlasmaState } from './types';

export function getCardInstance(state: PlasmaState) {
    return (
        state.cardContract
    )
}

export function getPacksInstance(state: PlasmaState) {
    return (
        state.packsContract
    )
}