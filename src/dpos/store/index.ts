/**
 * @module dashboard.dpos
 */

import { plasmaModule } from "@/store/plasma"
import { ZERO, parseToWei } from "@/utils"
import BN from "bn.js"
import debug from "debug"
import Axios from "axios"
import { ICandidate, IDelegation } from "loom-js/dist/contracts/dpos3"
import { BareActionContext, getStoreBuilder } from "vuex-typex"
import { fromIDelegation, defaultState, FORMER_VALIDATORS, formerValidator } from "./helpers"
import * as mutations from "./mutations"
import { Delegation, DPOSState, HasDPOSState, Validator } from "./types"
import { Address, CryptoUtils } from "loom-js"
import { feedbackModule as feedback } from "@/feedback/store"
import * as Sentry from "@sentry/browser"
import { i18n } from "@/i18n"
import BigNumber from "bignumber.js"

const log = debug("dash.dpos")

const builder = getStoreBuilder<HasDPOSState>().module("dpos", defaultState())
const stateGetter = builder.state()

const dposModule = {
  get state() {
    return stateGetter()
  },

  rewardsUnclaimedTotal: builder.read(rewardsUnclaimedTotal),
  rewardsBeingClaimedTotal: builder.read(rewardsBeingClaimedTotal),
  getReferrer: builder.read(getReferrer),

  setConfig: builder.commit(mutations.setConfig),
  setElectionTime: builder.commit(mutations.setElectionTime),
  setAnalyticsData: builder.commit(mutations.setAnalyticsData),

  requestDelegation: builder.commit(requestDelegation),
  requestRedelegation: builder.commit(requestRedelegation),
  requestUndelegation: builder.commit(requestUndelegation),
  clearRequest: builder.commit(clearRequest),

  delegate: builder.dispatch(delegate),
  redelegate: builder.dispatch(redelegate),
  consolidate: builder.dispatch(consolidate),
  undelegate: builder.dispatch(undelegate),
  claimRewards: builder.dispatch(claimRewards),

  refreshElectionTime: builder.dispatch(refreshElectionTime),
  refreshContractState: builder.dispatch(refreshContractState),
  refreshValidators: builder.dispatch(refreshValidators),
  refreshDelegations: builder.dispatch(refreshDelegations),

  registerCandidate: builder.dispatch(registerCandidate),
  fetchAnalyticsData: builder.dispatch(fetchAnalyticsData),

}

// vuex module as a service
export { dposModule }

declare type ActionContext = BareActionContext<DPOSState, HasDPOSState>

// read/static

function rewardsUnclaimedTotal(state: DPOSState) {
  return state.rewards
    .filter((r) => !r.pending)
    .reduce((sum, r) => sum.add(r.amount), ZERO)
}
function rewardsBeingClaimedTotal(state: DPOSState) {
  return state.rewards
    .filter((r) => r.pending)
    .reduce((sum, r) => sum.add(r.amount), ZERO)
}

/**
 * reloads time until next election
 * A call is scheduled after each election
 * UI shouldn't have to expose this action to the user
 * @param ctx
 * @see {dpos.reactions}
 */
export async function refreshElectionTime(context: ActionContext) {
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
export async function refreshValidators(ctx: ActionContext) {
  const contract = ctx.state.contract!
  log("getValidatorsAsync")
  // Get all validators, candidates and delegations
  ctx.state.loading.validators = true
  const [validators, candidates, delegations] = await Promise.all([
    contract.getValidatorsAsync(),
    contract.getCandidatesAsync(),
    contract.getAllDelegations(),
  ])

  // candidates
  const nodes = candidates.map((c) => {
    const node = new Validator()
    node.setCandidateData(c)
    node.isBootstrap = ctx.state.bootstrapNodes.includes(node.addr)
    return node
  })

  // Helper
  const getOrCreate = (address: Address) => {
    const addr = address.local.toString().toLowerCase()
    let existing = nodes.find((node) => node.addr === addr)
    if (existing === undefined) {
      existing = formerValidator(address)
      nodes.push(existing)
    }
    return existing
  }

  validators.forEach((v) => {
    const node = getOrCreate(v.address)
    node.setValidatorData(v)
  })

  delegations
    .filter((d) => d.delegationsArray.length > 0)
    .forEach((d) => {
      const addr = d.delegationsArray[0].validator
      const node = getOrCreate(addr)
      node.stakedAmount = d.delegationTotal
      node.totalStaked = node.whitelistAmount.add(d.delegationTotal)
      node.allDelegations = d.delegationsArray
    })
  // use the address for those without names
  nodes
    .filter((n) => n.name === "")
    .forEach((n) => (n.name = n.addr.replace("0x", "loom")))

  ctx.state.validators = nodes.filter((n) => !n.totalStaked.isZero())
  ctx.state.loading.validators = false
}

export async function refreshContractState(context: ActionContext) {
  const { state } = context
  const contract = state.contract!

  const cs = await contract.getStateAsync()
  const stdRewardsRatio = new BigNumber("0.05")

  const fromBN = (n: BN) => new BigNumber(n.toString())

  state.maxYearlyRewards = fromBN(cs.maxYearlyRewards)
  state.totalWeightedStakes = fromBN(cs.totalWeightedAmountStaked)

  const expectedYearlyRewards = state.totalWeightedStakes.times(stdRewardsRatio)

  if (expectedYearlyRewards.gt(state.maxYearlyRewards)) {
    // shrink
    state.rewardsScalingFactor = state.maxYearlyRewards.div(expectedYearlyRewards)
  } else {
    state.rewardsScalingFactor = new BigNumber(1)
  }

  state.effectiveRewardsRatio = stdRewardsRatio.times(state.rewardsScalingFactor).times(100)
}

/**
 * Loads delegator delegations (and rewards)
 * expects an account address is set in DPOSState.address
 * Called after each new election
 * UI shouldn't have to expose this action to the user
 * @param ctx
 * @see {dpos.reactions}
 */
export async function refreshDelegations(context: ActionContext) {
  const { state } = context
  const contract = state.contract!
  state.loading.delegations = true
  const response = await contract.checkAllDelegationsAsync(
    plasmaModule.getAddress(),
  )

  state.delegations = response!.delegationsArray
    .filter((d) => d.index > 0)
    // filter "ghost delegations"
    .filter((d) => false === (d.amount.isZero() && d.updateAmount.isZero()))
    .map((item: IDelegation) => {
      const d: Delegation = fromIDelegation(item, state.validators)
      // add it to the corresponding validator so we avoid filtering later
      d.validator.delegations.push(d)
      return d
    })

  log("delegations", plasmaModule.getAddress().toString(), response)
  const rewards = response.delegationsArray
    .filter((d) => d.index === 0)
    .map((item) => fromIDelegation(item, state.validators))

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

function clearRequest(state: DPOSState) {
  state.intent = ""
  state.delegation = null
}

/**
 * this should have been just a mutation but mutations
 * cannot access rootState...
 * @param state
 * @param d
 */
export function requestRedelegation(state: DPOSState, d: Delegation) {
  state.intent = "redelegate"
  // copy
  state.delegation = { ...d }
}
export function requestUndelegation(state: DPOSState, d: Delegation) {
  state.intent = "undelegate"
  // copy
  state.delegation = { ...d }
}

export async function delegate(context: ActionContext, delegation: Delegation) {
  const { state } = context
  const contract = state.contract!

  feedback.setTask(i18n.t("feedback_msg.task.delegate").toString())

  const approved = await plasmaModule.approve({
    symbol: "LOOM",
    weiAmount: delegation.amount,
    to: contract.address.local.toString(),
  })

  if (!approved) {
    feedback.endTask()
    return
  }

  try {
    feedback.setStep(i18n.t("feedback_msg.step.delegating").toString())
    await context.state.contract!.delegateAsync(
      delegation.validator.address,
      delegation.amount,
      delegation.lockTimeTier,
      // delegation.referrer,
    )
    feedback.endTask()
  } catch (error) {
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.err_while_delegate").toString())
    console.error(error)
    Sentry.withScope((scope) => {
      scope.setExtra("delegations", {
        delegations: JSON.stringify({
          amount: delegation.amount.toString(),
          lockTimeTier: delegation.lockTimeTier,
          validator: delegation.validator.address.local.toString(),
        }),
      })
      Sentry.captureException(error)
    })
  }
}

function getReferrer() {
  if ("imToken" in window ||
    // @ts-ignore
    ("ethereum" in window && window.ethereum.isImToken)
  ) return "imToken"

  // @ts-ignore
  const web3 = window.web3
  if (!web3) return ""

  if (web3.isCobo) return "cobo"

  if (web3.currentProvider.isTrust) return "trust"

  if (web3.currentProvider.isGoWallet) return "goWallet"

  if (web3.currentProvider.isAlphaWallet) return "alphaWallet"

  if (web3.currentProvider.isStatus) return "status"

  if (web3.currentProvider.isToshi) return "coinbase"

  if ("__CIPHER__" in window) return "cipher"

  if (web3.currentProvider.isMetaMask) return "metamask"

  return ""
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
export async function redelegate(context: ActionContext, delegation: Delegation) {
  feedback.setTask(i18n.t("feedback_msg.task.redelegating").toString())
  feedback.setStep(i18n.t("feedback_msg.step.scheduling_redelegate").toString()) // amount validator
  try {
    await context.state.contract!.redelegateAsync(
      delegation.validator.address,
      delegation.updateValidator!.address,
      delegation.updateAmount,
      delegation.index,
      // referer
    )
    feedback.endTask()
  } catch (error) {
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.err_while_redelegate").toString())
    Sentry.withScope((scope) => {
      scope.setExtra("redelegations", {
        redelegations: JSON.stringify({
          validator: delegation.validator.address.local.toString(),
          updateValidator: delegation.updateValidator!.address.local.toString(),
          updateAmount: delegation.updateAmount.toString(),
          index: delegation.index,
        }),
      })
      Sentry.captureException(error)
    })
  }
}

async function consolidate(context: ActionContext, validator: ICandidate) {
  feedback.setTask(i18n.t("feedback_msg.task.consolidating").toString())
  feedback.setStep(i18n.t("feedback_msg.step.consolidating_unlocked_on").toString() + validator.name)
  try {
    await context.state.contract!.consolidateDelegations(validator.address)
    feedback.endTask()
  } catch (error) {
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.err_while_redelegate").toString())
    Sentry.withScope((scope) => {
      scope.setExtra("consolidate", {
        consolidate: JSON.stringify({
          validator: validator.address.local.toString(),
        }),
      })
      Sentry.captureException(error)
    })
  }
}

/**
 *
 * @param context
 * @param delegation   where:
 *  - validator is the source validator
 *  - index is the delegation index in the source validator
 *  - updateAmount is the amount to un-delegate
 */
export async function undelegate(context: ActionContext, delegation: Delegation) {
  feedback.setTask(i18n.t("feedback_msg.task.undelegating").toString())
  feedback.setStep(i18n.t("feedback_msg.step.undelegating_from").toString() + delegation.validator.name)
  try {
    await context.state.contract!.unbondAsync(
      delegation.validator.address,
      delegation.updateAmount,
      delegation.index,
    )
    feedback.endTask()
  } catch (error) {
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.err_while_undelegate").toString())
    Sentry.withScope((scope) => {
      scope.setExtra("undelegations", {
        undelegations: JSON.stringify({
          validator: delegation.validator.address.local.toString(),
          updateAmount: delegation.updateAmount.toString(),
          index: delegation.index,
        }),
      })
      Sentry.captureException(error)
    })
  }
}

/**
 * withdraw from gateway to ethereum account
 * @param symbol
 */
async function claimRewards(context: ActionContext) {
  const contract = context.state.contract!
  // limbo context.rootState.plasma.chainId
  const limboValidator = Address.fromString(
    context.rootState.plasma.chainId + ":0x" + "".padEnd(40, "0"),
  )
  feedback.setTask(i18n.t("feedback_msg.task.claiming_reward").toString())
  feedback.setStep(i18n.t("feedback_msg.step.checking_reward").toString())
  const limboDelegations = await contract.checkDelegationAsync(
    limboValidator,
    plasmaModule.getAddress(),
  )
  if (limboDelegations!.delegationsArray.length > 0) {
    feedback.setStep(i18n.t("feedback_msg.step.claiming_dpos_reward").toString()) // add amount
    await contract.unbondAsync(limboValidator, 0, 0)
  }
  try {
    feedback.setStep(i18n.t("feedback_msg.step.claiming_reward").toString()) // add amount
    await contract.claimDelegatorRewardsAsync()
    // TODO remove once claimDelegatorRewardsAsync covers past validators
    await tmpClaimFormerValidatorsRewards(context)
    feedback.endTask()
    feedback.showInfo(i18n.t("feedback_msg.info.reward_claimed").toString())
  } catch (error) {
    feedback.endTask()
    feedback.showError(i18n.t("feedback_msg.error.err_while_claiming").toString())
  }

}

/**
 * Checks if account has rewards from validators that are no longer active
 * This is temporary until DPOS.claimDelegatorRewardsAsync covers this case
 * @param context
 */
async function tmpClaimFormerValidatorsRewards(context: ActionContext) {
  const contract = context.state.contract!
  const response = await contract.checkAllDelegationsAsync(plasmaModule.getAddress())

  const isFormerValidator = (vAddr: Address): boolean => {
    const addr = vAddr.local.toString().toLowerCase()
    const found = context.state.validators.find((v) => v.addr === addr)
    return found === undefined
  }
  const rewardsToUnbond = response.delegationsArray
    .filter((entry) => entry.index === 0 && isFormerValidator(entry.validator))

  for (const reward of rewardsToUnbond) {
    feedback.setStep(
      i18n.t("feedback_msg.step.claiming_past_reward", [reward.validator.local.toString()]).toString())
    await contract.unbondAsync(reward.validator, 0, 0)
  }
}

/**
 * NOTE: make sure candiate.pubKey corresponds to rootState.plasma.address
 * @param context
 * @param candidate
 */
export async function registerCandidate(context: ActionContext, candidate: ICandidate) {
  const balance = context.rootState.plasma.coins.LOOM.balance
  const weiAmount = parseToWei("1250000")

  if (balance.lt(weiAmount)) {
    feedback.showError(i18n.t("feedback_msg.error.insufficient_funds").toString())
    return
  }

  const token = "LOOM"
  const addressString = context.rootState.dpos.contract!.address.local.toString()
  const allowance = await plasmaModule.allowance({ token, spender: addressString })

  if (allowance.lt(weiAmount)) {
    try {
      await plasmaModule.approve({ symbol: token, weiAmount, to: addressString })
    } catch (err) {
      console.error(err)
      feedback.showError(i18n.t("feedback_msg.error.approval_failed").toString())
      return
    }
  }

  try {
    await context.state.contract!.registerCandidateAsync(
      CryptoUtils.Uint8ArrayToB64(candidate.pubKey),
      candidate.fee,
      candidate.name,
      candidate.description,
      candidate.website,
      candidate.whitelistLocktimeTier,
    )

    feedback.showSuccess(i18n.t("feedback_msg.success.register_success").toString())
  } catch (err) {
    console.error(err)
    feedback.showError(i18n.t("feedback_msg.error.err_while_register").toString())
  }
}

export async function fetchAnalyticsData(context: ActionContext) {
  const response = await Axios.get(context.rootState.dpos.analyticsUrl + "/delegation/total?from_date&to_date")
  dposModule.setAnalyticsData(response.data.data)
}
