/**
 * @module dashboard.dpos
 */

import { plasmaModule } from "@/store/plasma"
import { ZERO } from "@/utils"
import BN from "bn.js"
import debug from "debug"
import { ICandidate, IDelegation } from "loom-js/dist/contracts/dpos3"
import { BareActionContext, getStoreBuilder } from "vuex-typex"
import { fromIDelegation, defaultState } from "./helpers"
import * as mutations from "./mutations"
import { Delegation, DPOSState, HasDPOSState, Validator } from "./types"
import { Address } from "loom-js"

const log = debug("dpos")

const builder = getStoreBuilder<HasDPOSState>().module("dpos", defaultState())
const stateGetter = builder.state()

const dposModule = {
  get state() {
    return stateGetter()
  },

  setElectionTime: builder.commit(mutations.setElectionTime),
  setRewards: builder.commit(mutations.setRewards),

  requestDelegation: builder.commit(requestDelegation),
  requestRedelegation: builder.commit(requestRedelegation),
  requestUndelegation: builder.commit(requestUndelegation),
  cancelRequest: builder.commit(cancelRequest),

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
  if (context.state.contract === null) {
    console.warn("DPoS contract not initialized yet")
    return
  }
  log("refreshElectionTime")
  const contract = context.state.contract!
  const time: BN = await contract.getTimeUntilElectionAsync()
  const date = Date.now() + time.toNumber() * 1000
  log("refreshElectionTime", new Date(date))
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
  log("getValidatorsAsync")
  // Get all validators, candidates and delegations
  const [validators, candidates, delegations] = await Promise.all([
    contract.getValidatorsAsync(),
    contract.getCandidatesAsync(),
    contract.getAllDelegations(),
  ])
  //
  const nodes = candidates.map((c) => {
    const node = new Validator()
    node.setCandidateData(c)
    return node
  })
  // Helper: if node not found in the array
  // creates a new one with given addr
  const getOrCreate = (addr) => {
    let existing = nodes.find((node) => node.addr === addr)
    if (existing === undefined) {
      existing = new Validator()
      existing.addr = addr
      nodes.push(existing)
    }
    return existing
  }

  validators.forEach((v) => {
    const node = getOrCreate(v.address.local.toString())
    node.setValidatorData(v)
  })

  delegations
    .filter((d) => d.delegationsArray.length > 0)
    .forEach((d) => {
      const addr = d.delegationsArray[0].validator.local.toString()
      const node = getOrCreate(addr)
      node.stakedAmount = d.delegationTotal
    })
  // use the address for those without names
  nodes
    .filter((n) => n.name === "")
    .forEach((n) => (n.name = n.addr.replace("0x", "loom")))

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
  const { state } = context
  const contract = state.contract!
  state.loading.delegations = true
  const response = await contract.checkAllDelegationsAsync(
    plasmaModule.getAddress(),
  )

  state.delegations = response!.delegationsArray
    .filter((d) => d.index > 0)
    .map((item: IDelegation) => {
      const d: Delegation = fromIDelegation(item, state.validators)
      // add it to the corresponding validator so we avoid filtering later
      d.validator.delegations.push(d)
      return d
    })

  log("delegations", plasmaModule.getAddress().toString(), response)
  const rewards = response.delegationsArray
    .filter((d) => d.index === 0)
    .reduce((sum: BN, d) => sum.add(d.amount), ZERO)

  state.rewards = rewards
  log("rewards", rewards.toString())
  state.loading.delegations = false
}

export function requestDelegation(state: DPOSState, validator: ICandidate) {
  state.intent = "delegate"
  state.delegation = fromIDelegation(
    {
      validator: validator.address,
      delegator: plasmaModule.getAddress(),
      index: -1,
      amount: ZERO,
      updateAmount: ZERO,
      lockTime: -1,
      lockTimeTier: -1,
      state: -1,
      referrer: "",
    },
    state.validators,
  )
  // set state thqt triggers pop
}

function cancelRequest(state: DPOSState) {
  state.intent = ""
  state.delegation = null
}

/**
 * this should have been just a mutation but mutations
 * cannot access rootState...
 * @param state
 * @param d
 */
function requestRedelegation(state: DPOSState, d: Delegation) {
  state.intent = "redelegate"
  // copy
  state.delegation = { ...d }
}
function requestUndelegation(state: DPOSState, d: Delegation) {
  state.intent = "undelegate"
  // copy
  state.delegation = { ...d }
}

async function delegate(context: ActionContext, delegation: Delegation) {
  const { state } = context
  const contract = state.contract!

  // feedback.setTask("delegating x loom to {validatror.name}")
  await plasmaModule.approve({
    symbol: "LOOM",
    weiAmount: delegation.amount,
    to: contract.address.local.toString(),
  })
  // feedback.setStep("delegating...<amoubt> to <validator>")
  await context.state.contract!.delegateAsync(
    delegation.validator.address,
    delegation.amount,
    delegation.lockTimeTier,
    delegation.referrer,
  )
  // feedback.endTask()
}

/**
 * -
 * @param context
 * @param delegation  where:
 *  - validator is the source validator
 *  - index is the source delegation index
 *  - updateValidator is the target validator
 *  - updateAmount is the amount to redelegate
 */
async function redelegate(context: ActionContext, delegation: Delegation) {
  // feedback.setTask("redalgating")
  // feedback.setStep("redelegating...<amoubt> to <validator>")
  await context.state.contract!.redelegateAsync(
    delegation.validator.address,
    delegation.updateValidator!.address,
    delegation.updateAmount,
    delegation.index,
    // referer
  )
  context.state.intent = ""
  context.state.delegation = null

  // feedback.endTask()
}

async function consolidate(context: ActionContext, validator: ICandidate) {
  // feedback.setTask("consolidating")
  // feedback.setStep("consolidate delegations on <validator>")
  await context.state.contract!.consolidateDelegations(validator.address)
  // feedback.endTask()
}

/**
 *
 * @param context
 * @param delegation   where:
 *  - validator is the source validator
 *  - index is the delegation index in the source validator
 *  - updateAmount is the amount to un-delegate
 */
async function undelegate(context: ActionContext, delegation: Delegation) {
  // feedback.setTask("dpos.undelegating", {validator:delegation.validator.name, amount: delegation.updateAmoumt.div(config.coins.loom.decimals)})
  await context.state.contract!.unbondAsync(
    delegation.validator.address,
    delegation.updateAmount,
    delegation.index,
  )
  // feedback.alert({type:"info", message:"Funds successfuly undelegated, your account will be credited after the next election")
  // feedback.alert("dpos.undelegate.success_credit_next")
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
async function claimRewards(context: ActionContext) {
  const contract = context.state.contract!
  // limbo
  const limboValidator = Address.fromString(
    context.rootState.plasma.chainId + ":0x00000000000000000000000000000000",
  )
  const limboDelegations = await contract.checkDelegationAsync(
    limboValidator,
    contract.caller,
  )
  if (limboDelegations!.delegationsArray.length > 0) {
    // feedback.setTask("claiming dpos 2 rewards")
    await contract.unbondAsync(limboValidator, 0, 0)
  }

  // feedback.setTask("dpos.claiming_rewards")
  return context.state.contract!.claimDelegatorRewardsAsync()
  // .then(() => feedback.endTask(), () => feedback.endTask())
  // feedback.endTask()
}
