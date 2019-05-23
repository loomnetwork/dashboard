/**
 * @module dpos-dashboard.gateway
 */

import { getStoreBuilder } from "vuex-typex"
import { timer } from "rxjs"
import { BareActionContext } from "vuex-typex"

import { DPOSState, HasDPOSState } from "./types"

import * as mutations from "./mutations"
import BN from "bn.js"
import { IDelegation, ICandidate } from "loom-js/dist/contracts/dpos3"
import { plasmaModule } from "../plasma"

import debug from "debug"
import { DelegationState } from "loom-js/dist/proto/dposv3_pb"
const log = debug("dpos")

const initialState: DPOSState = {
    bootstrapNodes: [],
    contract: null,
    loading: {
        electionTime: false,
        validators: false,
        delegations: false,
        rewards: false,
    },
    electionTime: new Date(),
    validators: [],
    delegations: [],
    rewards: new BN(0),
}

const builder = getStoreBuilder<HasDPOSState>().module("dpos", initialState)
const stateGetter = builder.state()

const dposModule = {

    get state() { return stateGetter() },

    setElectionTime: builder.commit(mutations.setElectionTime),
    setRewards: builder.commit(mutations.setRewards),

    delegate: builder.dispatch(delegate),
    redelegate: builder.dispatch(redelegate),
    consolidate: builder.dispatch(consolidate),
    undelegate: builder.dispatch(undelegate),
    claimRewards: builder.dispatch(claimRewards),

    refreshElectionTime: builder.dispatch(refreshElectionTime),
    refreshValidators: builder.dispatch(refreshValidators),
    refreshDelegations: builder.dispatch(refreshDelegations),
}

// vuex module as a service
export { dposModule }

declare type ActionContext = BareActionContext<DPOSState, HasDPOSState>

// read/static

/**
 * reloads time until next election
 * A call is scheduled after each election
 * UI shouldn't have to expose this action to the user
 * @param ctx
 * @see {dpos.reactions}
 */
async function refreshElectionTime(context: ActionContext) {
    log("refreshElectionTime")
    const contract = context.state.contract!
    const time: BN = await contract.getTimeUntilElectionAsync()
    const date = Date.now() + (time.toNumber() * 1000)
    dposModule.setElectionTime(new Date(date))
}

/**
 * Loads validator candidate and total delegations list
 * Called after each new election
 * UI shouldn't have to expose this action to the user
 * @param ctx
 * @see {dpos.reactions}
 */
async function refreshValidators(ctx: ActionContext) {
    const contract = ctx.state.contract!
    const ZERO = new BN("0")
    const template = {
      address: "",
      active: false,
      isBootstrap: false,
      totalStaked: ZERO,
      personalStake: ZERO,
      votingPower: ZERO,
      delegationTotal: ZERO,
      delegatedStake: ZERO,
      name: "",
      website: "",
      description: "",
      fee: "N/A",
      newFee: "N/A",
    }
    log("getValidatorsAsync")
    // Get all validators, candidates and delegations
    const [validators, candidates, delegations] = await Promise.all([
        contract.getValidatorsAsync(),
        contract.getCandidatesAsync(),
        contract.getAllDelegations(),
    ])
    const nodes = candidates.map((c) =>
      Object.assign({}, template, {
        address: c.address.local.toString(),
        personalStake: c.whitelistAmount,
        votingPower: c.delegationTotal,
        delegationsTotal: c.delegationTotal.sub(c.whitelistAmount),
        active: false,
        isBootstrap: ctx.state.bootstrapNodes.includes(c.name),
        name: c.name,
        website: c.website,
        description: c.description,
        fee: (c.fee / 100).toString(),
        newFee: (c.newFee / 100).toString(),
      }),
    )
    // helper
    const getOrCreate = (addr) => {
      let existing: any = nodes.find((node) => node.address === addr)
      if (!existing) {
        existing = Object.assign({}, template, { address: addr })
        nodes.push(existing)
      }
      return existing
    }

    validators.forEach((v) => {
      const addr = v.address.local.toString()
      const node = getOrCreate(addr)
      Object.assign(node, {
        active: true,
        personalStake: v.whitelistAmount,
        totalStaked: v.whitelistAmount, // default value for nodes without delegations
        votingPower: v.delegationTotal,
        delegationsTotal: v.delegationTotal.sub(v.whitelistAmount),
      })
    })

    delegations
      .filter((d) => d.delegationsArray.length > 0)
      .forEach((d) => {
        const addr = d.delegationsArray[0].validator.local.toString()
        const delegatedStake = d.delegationTotal
        const node = getOrCreate(addr)
        Object.assign(node, {
          delegatedStake,
          totalStaked: node.personalStake.add(delegatedStake),
        })
      })
    // use the address for those without names
    nodes.filter((n) => n.name === "").forEach((n) => (n.name = n.address))

    ctx.state.validators = nodes
    log("setValidators", nodes)

}

/**
 * Loads delegator delegations (and rewards)
 * expects an account address is set in DPOSState.address
 * Called after each new election
 * UI shouldn't have to expose this action to the user
 * @param ctx
 * @see {dpos.reactions}
 */
async function refreshDelegations(context: ActionContext) {
    const contract = context.state.contract!
    context.state.loading.delegations = true
    const response = await contract.checkAllDelegationsAsync(plasmaModule.getAddress())

    context.state.delegations = response!.delegationsArray.map( (d) => ({
        ...d,
        locked: (d.lockTime * 1000) > Date.now(),
        pending: d.state !== DelegationState.BONDED,
      }))
    log("delegations", plasmaModule.getAddress().toString(), response)

    const rewards = response.delegationsArray
        .filter((d) => d.index === 0)
        .reduce((sum: BN, d) => sum.add(d.amount), new BN("0"))

    context.state.rewards = rewards
    log("rewards", rewards.toString())
    context.state.loading.delegations = false
}

// write/[the bc word for it]

async function delegate(context: ActionContext, delegation: IDelegation) {
  const contract = context.state.contract!
  // feedback.beginProcess("delegating")
  await plasmaModule.approve({ symbol: "loom", tokenAmount: delegation.amount, to: contract.address.local.toString() })
  // feedback.nextStep("delegating...<amoubt> to <validator>")
  await context.state.contract!.delegateAsync(delegation.validator, delegation.amount, delegation.lockTimeTier)
  // feedbacl.endProcess()
}

async function redelegate(context: ActionContext, delegation: IDelegation) {
    // feedback.beginProcess("redalgating")
    // feedback.nextStep("redelegating...<amoubt> to <validator>")
    await context.state.contract!.redelegateAsync(
        delegation.validator,
        delegation.updateValidator!,
        delegation.updateAmount,
        delegation.index,
    )
    // feedback.endProcess()
}

async function consolidate(context: ActionContext, validator: ICandidate) {
    // feedback.pending("consolidate delegations on <validator>")
    await context.state.contract!.consolidateDelegations(validator.address)
    // feedback.done()

}

async function undelegate(context: ActionContext, delegation: IDelegation) {
    await context.state.contract!.unbondAsync(delegation.validator, delegation.updateAmount, delegation.index)
    // feedback.inform("Funds successfuly undelegated, your account will be credited after the next election")
    // feedback.inform("dpos.undelegate.success_credit_next")
  }

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
function claimRewards(context: ActionContext) {
    // filter delegations index = 0 amount > 0
    // for each
    // set message "claiming rewards from validator x"
    //
    return timer(2000).toPromise()
}
