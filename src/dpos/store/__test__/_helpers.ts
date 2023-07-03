import { ZERO } from "@/utils"
import { LocktimeTier, CandidateState } from "loom-js/dist/proto/dposv3_pb"
import { Address } from "loom-js"
import { feedbackModule } from "@/feedback/store"
import sinon from "sinon"
import { plasmaModule } from "@/store/plasma"
import { dposModule } from ".."
import { ethereumModule } from "@/store/ethereum"
import { dposUtils } from "../reactions"

export function emptyValidator() {
    return {
        address: Address.fromString("default:0x" + "".padEnd(40, "0")),
        pubKey: new Uint8Array(),
        delegationTotal: ZERO,
        slashPercentage: ZERO,
        whitelistAmount: ZERO,
        recentlyMissedBlocks: 0,
        whitelistLocktimeTier: LocktimeTier.TIER_ONE,
        fee: ZERO,
        newFee: ZERO,
        candidateState: CandidateState.REGISTERED,
        name: "",
        description: "",
        website: "",
        jailed: false,
    }
}

export const now = Date.now()
export const nowStub = sinon.stub(Date, "now")

export const feedbackModuleStub = sinon.stub(feedbackModule)

export const plasmaModuleStub = sinon.stub(plasmaModule)

export const dposModuleStub = sinon.stub(dposModule)

export const ethereumModuleStub = sinon.stub(ethereumModule)

export const dposUtilsStub = sinon.stub(dposUtils)
