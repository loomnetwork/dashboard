import { ERC20 } from "loom-js/dist/mainnet-contracts/ERC20";
import { timer } from "rxjs";
import BN from "bn.js"
import { BareActionContext } from "vuex-typex";
import { GatewayState } from "./types";
import { DashboardState } from "@/types";


declare type ActionContext = BareActionContext<GatewayState, DashboardState>

/**
 * deposit from ethereum account to gateway
 * @param symbol 
 * @param tokenAmount 
 */
export function deposit(context:ActionContext, payload:{symbol:string, tokenAmount?:BN}) {
    return timer(2000).toPromise()
}


/**
 * withdraw from plasma account to gateway
 * @param symbol 
 * @param tokenAmount 
 */
export function withdrawToGateway(context:ActionContext,  payload:{symbol:string, tokenAmount?:BN}) {
    return timer(2000).toPromise()
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol 
 */
export function withdrawFromGateway(context:ActionContext, symbol:string) {
    return timer(2000).toPromise()
}

export function checkPendingReceipt(context:ActionContext, symbol:string) {
    return timer(2000).toPromise()
}

