import { ZERO } from "@/utils"
import { LocktimeTier, CandidateState, DelegationState } from "loom-js/dist/proto/dposv3_pb"
import { Address, CryptoUtils } from "loom-js"
import { fromIDelegation } from "../helpers"
import { feedbackModule } from "@/feedback/store"
import sinon from "sinon"

export function emptyValidator() {
    return {
        address: Address.fromString("default:0x" + "".padEnd(40, "0")),
        pubKey: new Uint8Array(),
        delegationTotal: ZERO,
        slashPercentage: ZERO,
        whitelistAmount: ZERO,
        whitelistLocktimeTier: LocktimeTier.TIER_ONE,
        fee: ZERO,
        newFee: ZERO,
        candidateState: CandidateState.REGISTERED,
        name: "",
        description: "",
        website: "",
    }
}

export const feedback = sinon.stub(feedbackModule)
