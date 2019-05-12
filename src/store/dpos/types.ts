
import BN from "bn.js"
import { Provider } from "ethers/providers";
import { HasPlasmaState } from "../plasma/types";
import { IDelegation, IValidator, ICandidate, DPOS3 } from "loom-js/dist/contracts/dpos3";

// Interface for root stores that support EthereumState
export interface HasDPOSState extends HasPlasmaState {
    dpos: DPOSState
}

export interface DPOSState {
    contract: DPOS3|null
    loading: {
        electionTime: boolean,
        validators: boolean,
        delegations: boolean,
        rewards: boolean,
    }
    electionTime: Date
    validators: any[]
    delegations: IDelegation[]
    rewards: BN
}



export interface Validator extends IValidator, ICandidate {
    totalDelegated:BN
} 