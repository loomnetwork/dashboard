import axios from "axios"
import {
  CryptoUtils,
  LocalAddress,
  EthersSigner,
  getMetamaskSigner,
  SignedEthTxMiddleware,
  Client,
  createJSONRPCClient,
  NonceTxMiddleware,
  SignedTxMiddleware,
} from "loom-js"
import { formatToCrypto, getDomainType } from "../../utils"
import { initWeb3 as web3init } from "../../services/initWeb3"
import Web3 from "web3"
import debug from "debug"
import GatewayJSON from "@/contracts/Gateway.json"
import networks from "@/../chain-config"

import { ethers } from "ethers"

import { DPOS3, AddressMapper } from "loom-js/dist/contracts"
import { DPOSUserV3, Address } from "loom-js"
import BN from "bn.js"
import { DashboardState, DposState } from "@/types"
import { Log } from "ethers/providers"
import { getStoreBuilder } from "vuex-typex"

import * as getters from "./getters"
import * as mutations from "./mutations"

import { i18n } from "../../i18n"

// debug.enable("dashboard.DPOS")
const log = debug("dashboard.DPOS")
const WEI_TOKEN = new BN("" + 10 ** 18)

const DAILY_WITHDRAW_LIMIT = 500000
let GW_ADDRESS = ""

const hostname = window.location.hostname
if (hostname === "dashboard.dappchains.com") {
  GW_ADDRESS = ""
} else if (hostname === "dev-dashboard.dappchains.com") {
  GW_ADDRESS = ""
} else {
  GW_ADDRESS = ""
}

const defaultState = () => {
  return {
    web3: undefined,
    account: undefined,
    localAddress: undefined,
    count: 0,
    chainUrls: networks,
    networkId: getNetworkId(),
    currentChain: getCurrentChain(),
    dAppChainClient: null,
    metamaskStatus: undefined,
    metamaskError: undefined,
    validators: [],
    GatewayInstance: null,
    mappingStatus: "",
    dposUser: null,
    dpos3: undefined,
    isConnectedToDappChain: false,
    isLoggedIn: false,
    showSidebar: true,
    connectedToMetamask: false,
    currentMetamaskAddress: undefined,
    history: null,
    withdrawLimit: DAILY_WITHDRAW_LIMIT,
    status: "check_mapping",
    walletType: undefined,
    selectedAccount: undefined,
    metamaskDisabled: false,
    showSignWalletModal: false,
    showSigningAlert: false,
    showAlreadyMappedModal: false,
    mappingSuccess: false,
    gatewayBusy: false,
    userBalance: {
      isLoading: false,
      loomBalance: null,
      mainnetBalance: null,
      stakedAmount: null,
    },
    rewardsResults: null,
    timeUntilElectionCycle: null,
    // timestamp millis
    nextElectionTime: 0,
    validatorFields: [
      { key: "Name", sortable: true },
      { key: "Status", sortable: true },
      { key: "totalStaked", sortable: true, label: "Total Staked" },
      // { key: 'votingPower', sortable: true, label: "Reward Power" },
      // { key: 'Weight', sortable: true },
      { key: "Fees", sortable: true },
      // { key: 'Uptime', sortable: true },
      // { key: 'Slashes', sortable: true },
    ],
    prohibitedNodes: [
      "plasma-0",
      "plasma-1",
      "plasma-2",
      "plasma-3",
      "plasma-4",
      "plasma-5",
      "Validator #4",
      "test-z-us1-dappchains-2-aws0",
    ],
    latestBlockNumber: undefined,
    cachedEvents: [],
    dappChainEventUrl: "//dev-api.loom.games/plasma/address",
    historyPromise: null,
    dappChainEvents: [],
    states: ["Bonding", "Bonded", "Unbounding", "Redelegating"],
    delegations: [],
    dashboardPrivateKey:
      "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
    dashboardAddress: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
    analyticsEndpoint: "//dev-api.loom.games",
    client: null,
    mapper: null,
    analyticsData: null,
    showDepositForm: false,
    showDepositApproved: false,
    showDepositConfirmed: false,
    pendingTx: null,
    withdrewSignature: "",
  } as DposState
}

const builder = getStoreBuilder<DashboardState>().module("DPOS", defaultState())
const stateGetter = builder.state()

export const DPOSTypedStore = {
  get state() {
    return stateGetter()
  },

  // getters
  getLatestBlockNumber: builder.read(getters.getLatestBlockNumber),
  getCachedEvents: builder.read(getters.getCachedEvents),
  getDashboardAddressAsLocalAddress: builder.read(
    getters.getDashboardAddressAsLocalAddress,
  ),
  getFormattedValidators: builder.read(getters.getFormattedValidators),
  getWithdrewOn: builder.read(getters.getWithdrewOn),

  // mutations
  setUserBalance: builder.commit(mutations.setUserBalance),
  setCurrentMetamaskAddress: builder.commit(
    mutations.setCurrentMetamaskAddress,
  ),
  setStatus: builder.commit(mutations.setStatus),
  setShowSidebar: builder.commit(mutations.setShowSidebar),
  setShowSigningAlert: builder.commit(mutations.setShowSigningAlert),
  setSignWalletModal: builder.commit(mutations.setSignWalletModal),
  setIsLoggedIn: builder.commit(mutations.setIsLoggedIn),
  // ethereum
  setMetamaskDisabled: builder.commit(mutations.setMetamaskDisabled),
  setConnectedToMetamask: builder.commit(mutations.setConnectedToMetamask),
  setWalletType: builder.commit(mutations.setWalletType),
  setSelectedAccount: builder.commit(mutations.setSelectedAccount),
  setSelectedLedgerPath: builder.commit(mutations.setSelectedLedgerPath),
  setLatesBlockNumber: builder.commit(mutations.setLatesBlockNumber),
  setCachedEvents: builder.commit(mutations.setCachedEvents),
  setGatewayBusy: builder.commit(mutations.setGatewayBusy),
  setHistoryPromise: builder.commit(mutations.setHistoryPromise),

  // plasma
  setClient: builder.commit(mutations.setClient),
  setDappChainConnected: builder.commit(mutations.setDappChainConnected),
  setDappChainEvents: builder.commit(mutations.setDappChainEvents),

  // mapper
  switchDposUser: builder.dispatch(switchDposUser),
  setMapper: builder.commit(mutations.setMapper),
  setAlreadyMappedModal: builder.commit(mutations.setAlreadyMappedModal),
  setMappingSuccess: builder.commit(mutations.setMappingSuccess),
  setMappingStatus: builder.commit(mutations.setMappingStatus),
  setMappingError: builder.commit(mutations.setMappingError),

  // DPOS
  setDPOSUserV3: builder.commit(mutations.setDPOSUserV3),
  setValidators: builder.commit(mutations.setValidators),
  setTimeUntilElectionCycle: builder.commit(
    mutations.setTimeUntilElectionCycle,
  ),
  setNextElectionTime: builder.commit(mutations.setNextElectionTime),
  setAnalyticsData: builder.commit(mutations.setAnalyticsData),
  setDelegations: builder.commit(mutations.setDelegations),
  setRewardsResults: builder.commit(mutations.setRewardsResults),

  // gateway
  setShowDepositForm: builder.commit(mutations.setShowDepositForm),
  setShowDepositApproved: builder.commit(mutations.setShowDepositApproved),
  setShowDepositConfirmed: builder.commit(mutations.setShowDepositConfirmed),
  setPendingTx: builder.commit(mutations.setPendingTx),

  updateState: builder.commit(mutations.updateState),

  setMetamaskStatus: builder.commit(mutations.setMetamaskStatus),
  setMetamaskError: builder.commit(mutations.setMetamaskError),
  setWithdrewSignature: builder.commit(mutations.setWithdrewSignature),
  setWithdrewOn: builder.commit(mutations.setWithdrewOn),
  setNetworkId: builder.commit(mutations.setNetworkId),
  setCurrentChain: builder.commit(mutations.setCurrentChain),

  // actions
  initWeb3Local: builder.dispatch(initWeb3Local),
  initWeb3: builder.dispatch(initWeb3),
  initializeDependencies: builder.dispatch(initializeDependencies),

  ensureIdentityMappingExists: builder.dispatch(ensureIdentityMappingExists),
  createNewPlasmaUser: builder.dispatch(createNewPlasmaUser),
  checkMappingAccountStatus: builder.dispatch(checkMappingAccountStatus),
  storePrivateKeyFromSeed: builder.dispatch(storePrivateKeyFromSeed),
  checkIfConnected: builder.dispatch(checkIfConnected),

  fetchDappChainEvents: builder.dispatch(fetchDappChainEvents),
  fetchAnalyticsData: builder.dispatch(fetchAnalyticsData),
  loadEthereumHistory: builder.dispatch(loadEthereumHistory),
  updateDailyWithdrawLimit: builder.dispatch(updateDailyWithdrawLimit),
  addMappingAsync: builder.dispatch(addMappingAsync),
  approveDeposit: builder.dispatch(approveDeposit),
  executeDeposit: builder.dispatch(executeDeposit),
  depositAsync: builder.dispatch(depositAsync),
  withdrawAsync: builder.dispatch(withdrawAsync),
  approveAsync: builder.dispatch(approveAsync),

  getDpos3: builder.dispatch(getDpos3),
  initDposUser: builder.dispatch(initDposUser),
  delegateAsync: builder.dispatch(delegateAsync),
  redelegateAsync: builder.dispatch(redelegateAsync),
  undelegateAsync: builder.dispatch(undelegateAsync),
  queryRewards: builder.dispatch(queryRewards),
  claimRewardsAsync: builder.dispatch(claimRewardsAsync),
  getValidatorsAsync: builder.dispatch(getValidatorsAsync),
  checkAllDelegations: builder.dispatch(checkAllDelegations),
  consolidateDelegations: builder.dispatch(consolidateDelegations),
  getTimeUntilElectionsAsync: builder.dispatch(getTimeUntilElectionsAsync),

  // the rest fron dappchain store
  addChainUrl: builder.dispatch(addChainUrl),
  getMetamaskLoomBalance: builder.dispatch(getMetamaskLoomBalance),

  getDappchainLoomBalance: builder.dispatch(getDappchainLoomBalance),
  getUnclaimedLoomTokens: builder.dispatch(getUnclaimedLoomTokens),
  reclaimDeposit: builder.dispatch(reclaimDeposit),
  getPendingWithdrawalReceipt: builder.dispatch(getPendingWithdrawalReceipt),
  withdrawCoinGatewayAsync: builder.dispatch(withdrawCoinGatewayAsync),
  init: builder.dispatch(init),
  showMsg: builder.dispatch(showMsg),
}

// const DPOSStore = builder.vuexModule()

// actions

import { BareActionContext } from "vuex-typex"
// import { DappChainTypedModule } from '../dappchain';
import { CommonTypedStore } from "../common"
import { createDefaultClient } from "loom-js/dist/helpers"
import { feedbackModule } from "@/feedback/store"

// shorthand for action context
declare type Context = BareActionContext<DposState, DashboardState>

async function initializeDependencies(ctx: Context, payload) {
  CommonTypedStore.setShowLoadingSpinner(true)
  try {
    await DPOSTypedStore.initWeb3Local()
    await DPOSTypedStore.ensureIdentityMappingExists({})
    await DPOSTypedStore.checkMappingAccountStatus()
    await DPOSTypedStore.initDposUser()
  } catch (err) {
    if (err.message === "no Metamask installation detected") {
      DPOSTypedStore.setMetamaskDisabled(true)
    }
    feedbackModule.showError("An error occurred, please refresh the page")
    CommonTypedStore.setShowLoadingSpinner(false)
    throw err
  }
  CommonTypedStore.setShowLoadingSpinner(false)
}

async function checkMappingAccountStatus(ctx: Context) {
  DPOSTypedStore.setSignWalletModal(false)
  DPOSTypedStore.setAlreadyMappedModal(false)
  if (
    ctx.state.status === "no_mapping" &&
    ctx.state.mappingError === undefined
  ) {
    try {
      DPOSTypedStore.setSignWalletModal(true)
      CommonTypedStore.setShowLoadingSpinner(true)
      await DPOSTypedStore.createNewPlasmaUser()
      // await DappChainTypedModule.addMappingAsync(  null )
      CommonTypedStore.setShowLoadingSpinner(false)
      DPOSTypedStore.setMappingSuccess(true)
      DPOSTypedStore.setSignWalletModal(false)
    } catch (err) {
      console.log("add mapping async error", err)
      DPOSTypedStore.setSignWalletModal(false)
      if (err.message.includes("identity mapping already exists")) {
        DPOSTypedStore.setAlreadyMappedModal(true)
      } else {
        feedbackModule.showError(err.message)
      }
    }
  } else if (
    ctx.state.status === "no_mapping" &&
    ctx.state.mappingError !== undefined
  ) {
    DPOSTypedStore.setSignWalletModal(false)
    // if (err.message.includes("identity mapping already exists")) {
    //   DPOSTypedStore.setAlreadyMappedModal(true);
    // } else {
    //   commit("setErrorMsg", {msg: err.message, forever: false, report: true, cause: err}, { root: true })
    // }
  } else if (ctx.state.status === "mapped") {
    DPOSTypedStore.setMappingSuccess(true)
  }
  CommonTypedStore.setShowLoadingSpinner(false)
}
async function storePrivateKeyFromSeed(ctx, payload) {
  const privateKey = CryptoUtils.generatePrivateKeyFromSeed(
    payload.seed.slice(0, 32),
  )
  const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
  sessionStorage.setItem("privatekey", privateKeyString)
  DPOSTypedStore.setIsLoggedIn(true)
}

async function checkIfConnected(ctx: Context) {
  if (!ctx.state.web3) await DPOSTypedStore.initWeb3()
}
// broken
async function initWeb3Local(ctx: Context) {
  if (ctx.state.walletType === "metamask") {
    // @ts-ignore
    const web3js: Web3 = await web3init()
    const accounts = await web3js.eth.getAccounts()
    const metamaskAccount = accounts[0]
    // @ts-ignore
    // DPOSTypedStore.setWeb3(web3js)
    DPOSTypedStore.setCurrentMetamaskAddress(metamaskAccount)
  } else if (ctx.state.walletType === "ledger") {
    if (ctx.state.selectedLedgerPath) {
      // let web3js = await initWeb3SelectedWallet(ctx.state.selectedLedgerPath)
      // DPOSTypedStore.setWeb3(web3js);
    } else {
      console.error("no HD path selected")
      throw new Error("No HD path selected")
    }
  }
  DPOSTypedStore.setConnectedToMetamask(true)
  await DPOSTypedStore.init()
  // await DPOSTypedStore.registerWeb3({ web3: ctx.state.web3 })
}

async function initWeb3(ctx: Context) {
  let web3js
  // @ts-ignore
  if (window.ethereum) {
    // @ts-ignore
    window.web3 = new Web3(ethereum)
    // @ts-ignore
    web3js = new Web3(ethereum)
    try {
      // @ts-ignore
      await ethereum.enable()
    } catch (err) {
      CommonTypedStore.setError({
        err: "User denied access to Metamask",
        msg: "User denied access to Metamask",
      })
      return
    }
    // @ts-ignore
  } else if (window.web3) {
    // @ts-ignore
    window.web3 = new Web3(window.web3.currentProvider)
    // @ts-ignore
    web3js = new Web3(window.web3.currentProvider)
  } else {
    CommonTypedStore.setError({
      err: "Metamask is not Enabled",
      msg: "User denied access to Metamask",
    })
  }
  // @ts-ignore
  // DPOSTypedStore.setWeb3(web3js)
}

async function checkAllDelegations(ctx: Context) {
  const user = await requireDposUser(ctx)
  log("checkAllDelegationsAsync")
  const {
    amount,
    weightedAmount,
    delegationsArray,
  } = await user.checkAllDelegationsAsync()
  log("delegations", delegationsArray)
  const filteredDelegations = delegationsArray
    // delegation with index 0 represents rewards
    .filter((d) => d.index > 0)
    .filter((d) => !(d.amount.isZero() && d.updateAmount.isZero()))
    // add string address to make it easy to compare
    .map((d) =>
      Object.assign(d, {
        validatorStr: d.validator.local.toString(),
      }),
    )
  const userBalance = ctx.state.userBalance
  const stakedAmount = formatToCrypto(weightedAmount.toString())
  DPOSTypedStore.setDelegations(filteredDelegations)
  DPOSTypedStore.setUserBalance(Object.assign(userBalance, { stakedAmount }))
}
async function consolidateDelegations(ctx: Context, validator) {
  const user = await requireDposUser(ctx)

  const address = Address.fromString(
    `${user.client.chainId}:${validator.address}`,
  )
  log("consolidateDelegations")
  await user.dappchainDPOS.consolidateDelegations(address)
}
async function queryRewards(ctx: Context) {
  throw new Error("Use new store")
  const user = await requireDposUser(ctx)
  try {
    log("queryRewards")
    const result = await user.checkDelegatorRewardsAsync()
    const formattedResult = formatToCrypto(result)
    DPOSTypedStore.setRewardsResults(formattedResult)
  } catch (err) {
    if (err.message.includes("Distribution record not found")) {
      DPOSTypedStore.setRewardsResults("0")
    } else {
      feedbackModule.showError("Failed querying rewards")
    }
  }
}

async function claimRewardsAsync(ctx: Context) {
  const user = await requireDposUser(ctx)
  try {
    log("claimRewardsAsync")
    await user.claimDelegatorRewardsAsync()
  } catch (err) {
    console.error(err)
  }
}
// this can be moved out as is automatically called once dposUser is set
// actually instead of depending on dposUser we should depend on dpos contract
// (if we want to display timer in "anonymous" session)
async function getTimeUntilElectionsAsync(ctx: Context) {
  log("getTimeUntilElectionsAsync")
  const dpos = await DPOSTypedStore.getDpos3({})
  try {
    const result: BN = await dpos.getTimeUntilElectionAsync()
    log("next election in %s seconds", result.toNumber())
    DPOSTypedStore.setTimeUntilElectionCycle("" + result.toNumber())
    DPOSTypedStore.setNextElectionTime(Date.now() + result.toNumber() * 1000) // Date.now() + (result.toNumber()*1000))
  } catch (err) {
    console.error(err)
  }
}

async function addMappingAsync(ctx: Context) {
  if (!ctx.state.dposUser) {
    await DPOSTypedStore.initDposUser()
  }
  try {
    const user = await ctx.state.dposUser!
    await user.mapAccountsAsync()
    DPOSTypedStore.setStatus("mapped")
  } catch (err) {
    DPOSTypedStore.setMappingError(err.message)
    throw Error(err.message.toString())
  }
}

async function redelegateAsync(
  ctx: Context,
  payload: { origin: string; target: string; amount: string; index: number },
) {
  const user = await requireDposUser(ctx)
  const { origin, target, amount, index } = payload

  try {
    await user.redelegateAsync(origin, target, new BN(amount), index)
    feedbackModule.showSuccess(i18n.t("messages.redelegate_success_tx").toString())
  } catch (err) {
    console.error(err)
    feedbackModule.showError(i18n.t("messages.redelegate_err_tx").toString())
  }
}

async function fetchDappChainEvents(ctx: Context) {
  const { currentMetamaskAddress, dappChainEventUrl } = ctx.state
  const historyPromise = axios.get(
    `${dappChainEventUrl}/eth:${currentMetamaskAddress}?sort=-block_height`,
  )
  // Store the unresolved promise
  DPOSTypedStore.setHistoryPromise(historyPromise)

  historyPromise
    .then((response) => {
      return response.data.txs
        .filter(
          (tx) =>
            tx.topic === "event:WithdrawLoomCoin" ||
            tx.topic === "event:MainnetDepositEvent" ||
            tx.topic === "event:MainnetWithdrawalEvent",
        )
        .map((tx) => {
          let type = ""
          switch (tx.topic) {
            case "event:MainnetDepositEvent":
              type = "Deposit"
              break
            case "event:MainnetWithdrawalEvent":
              type = "Withdraw"
              break
            case "event:WithdrawLoomCoin":
              type = "Withdraw Begun"
              break
            default:
              type = "Other"
              break
          }

          const amount = tx.token_amount

          // Return events in this format
          return {
            "Block #": tx.block_height,
            "Event": type,
            "Amount": formatToCrypto(amount),
            "Tx Hash": tx.tx_hash,
          }
        })
    })
    .catch((err) => {
      console.error(err)
    })
    .then((results) => {
      DPOSTypedStore.setDappChainEvents(results)
    })
}

async function fetchAnalyticsData(ctx: Context) {
  // TODO: Uncomment to use .env
  // let url = process.env.VUE_APP_ANALYTICS_URL
  // let dataPromise = await axios.get(url + "/delegation/total?from_date&to_date")
  const url = ctx.state.analyticsEndpoint
  const data = await axios.get(url + "/delegation/total?from_date&to_date")
  DPOSTypedStore.setAnalyticsData(data)
}
async function loadEthereumHistory(ctx: Context) {
  log("loadEthereumHistory")
  const user = await requireDposUser(ctx)
  const loom = user.ethereumLoom
  const gateway = user.ethereumGateway
  const provider = user.ethereumGateway.provider
  const cachedEvents = DPOSTypedStore.getCachedEvents()
  // Get latest mined block from Ethereum
  const depositFilter = loom.filters.Transfer(
    user.ethAddress,
    gateway.address,
    null,
  )
  const withdrawFilter = loom.filters.Transfer(
    gateway.address,
    user.ethAddress,
    null,
  )
  let deposits: Log[]
  let withdraws: Log[]
  let toBlock
  try {
    deposits = await loom.provider.getLogs(depositFilter)
    withdraws = await loom.provider.getLogs(withdrawFilter)
    toBlock = await provider.getBlockNumber()
  } catch (e) {
    console.error(e)
    return []
  }

  const history = deposits
    .map((entry) => ({
      "Block #": entry.blockNumber!,
      "Event": "Deposit",
      "Amount": formatToCrypto(entry.topics[2]),
      "Tx Hash": entry.transactionHash,
    }))
    .concat(
      withdraws.map((entry) => ({
        "Block #": entry.blockNumber!,
        "Event": "Withdraw",
        "Amount": formatToCrypto(entry.topics[2]),
        "Tx Hash": entry.transactionHash,
      })),
    )
    .sort((a, b) => a["Block #"] - b["Block #"])

  const mergedEvents: any[] = cachedEvents.concat(history)
  DPOSTypedStore.setLatesBlockNumber(toBlock)
  DPOSTypedStore.setCachedEvents(mergedEvents)
  log("ethereum history", mergedEvents)
  return mergedEvents
}

async function updateDailyWithdrawLimit(ctx: Context, history) {
  // TODO externalise this
  const limit = history
    .filter((item) => item.Event === "Withdraw") // and date is today
    .reduce(
      (left, item) => left - parseInt(item.Amount, 10),
      DAILY_WITHDRAW_LIMIT,
    )
  ctx.state.withdrawLimit = Math.max(0, limit)
  log("ctx.state.withdrawLimit", ctx.state.withdrawLimit)
  return ctx.state.withdrawLimit
}
/**
 * sends an approval request and does not wait for a confirmation
 * as we listen to confirmations on the contract
 * @param {*} param0
 * @param {*} tokenAmount
 * @see dposPlugin
 */
async function approveDeposit(ctx: Context, tokenAmount: string) {
  const user = await requireDposUser(ctx)
  const loom = user.ethereumLoom
  const gw = user.ethereumGateway
  const wei = ethers.utils.parseEther(tokenAmount)
  log("approve", gw.address, wei.toString(), wei)
  return executeTx("deposit approval", () =>
    loom.functions.approve(gw.address, wei.toString()),
  )
}
/**
 * deposits amount: min(allowance, floor(ballance))
 * if amount > 0
 * todo handle error
 *
 * @param {Store} param0
 * @param {ethers.utils.BigNumber} weiAmount
 */
async function executeDeposit(ctx: Context) {
  const user = await requireDposUser(ctx)
  const loom = user.ethereumLoom
  const gw = user.ethereumGateway
  const account = user.ethAddress
  const rawAmount = await Promise.all([
    loom.balanceOf(account),
    loom.allowance(account, gw.address),
  ]).then(([balance, allowance]) => {
    log("balance %s allowance %s", balance.toString(), allowance.toString())
    return allowance.lt(balance) ? allowance : balance
  })

  // rounding...
  const amount = rawAmount.sub(rawAmount.mod(ethers.constants.WeiPerEther))
  if (amount.isZero()) {
    throw new Error("No allowance or insufisient funds")
  }
  log("depositERC20 %s ", amount.toString(), loom.address)

  await executeTx("deposit", () =>
    gw.functions.depositERC20(amount.toString(), loom.address),
  )
}

async function executeTx(type: string, fn) {
  const pendingTx = { type, hash: "" }
  DPOSTypedStore.setGatewayBusy(true)
  try {
    const tx = await fn()
    log("pending tx", tx.hash)
    pendingTx.hash = tx.hash
  } catch (err) {
    // imToken funky output
    if (err.transactionHash) {
      pendingTx.hash = err.transactionHash
    } else {
      DPOSTypedStore.setGatewayBusy(false)
      throw err
    }
  }

  DPOSTypedStore.setPendingTx(pendingTx)
  DPOSTypedStore.setGatewayBusy(false)
}

async function ensureIdentityMappingExists(
  ctx: Context,
  payload: { currentAddress?: string },
) {
  let metamaskAddress = ""
  if (payload.currentAddress) {
    metamaskAddress = payload.currentAddress.toLowerCase()
  } else {
    metamaskAddress = ctx.rootState.DPOS.currentMetamaskAddress.toLowerCase()
  }

  const client = createClient(ctx.state, ctx.rootState.DPOS.dashboardPrivateKey)
  DPOSTypedStore.setClient(client)

  try {
    DPOSTypedStore.setStatus("check_mapping")
    DPOSTypedStore.setMappingError(null)
    DPOSTypedStore.setMappingStatus("")

    const dashboardAddress = new Address(
      "default",
      LocalAddress.fromHexString(ctx.rootState.DPOS.dashboardAddress),
    )
    const addressMapper = await AddressMapper.createAsync(
      client,
      dashboardAddress,
    )
    DPOSTypedStore.setMapper(addressMapper)
    const address = new Address(
      "eth",
      LocalAddress.fromHexString(metamaskAddress),
    )
    const mapping = await addressMapper.getMappingAsync(address)
    DPOSTypedStore.setStatus("mapped")
    // DPOSTypedStore.setMapping(mapping)
  } catch (err) {
    DPOSTypedStore.setStatus("no_mapping")
    console.error("Error ensuring mapping exists: ", err)
    // commit('setErrorMsg', {msg: `Error mapping identities, please try again`, forever: true}, {root: true})
    return
  }
}
async function createNewPlasmaUser(ctx: Context) {
  const privateKey = CryptoUtils.generatePrivateKey()
  const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  const address = LocalAddress.fromPublicKey(publicKey)
  const ethAddr = ctx.state.currentMetamaskAddress.toLowerCase()
  const wallet = getMetamaskSigner(ctx.state.web3.currentProvider)
  const signer = new EthersSigner(wallet)

  const one = new Address("default", address)
  const two = new Address("eth", LocalAddress.fromHexString(ethAddr))
  const client = createClient(ctx.state, privateKeyString)
  const addressMapper = await AddressMapper.createAsync(client, one)
  await addressMapper.addIdentityMappingAsync(one, two, signer)
}
async function delegateAsync(
  ctx: Context,
  payload: { amount: any; candidate: string; tier: number },
) {
  if (!ctx.state.dposUser) {
    throw new Error("expected dposUser to be initialized")
  }
  const user: DPOSUserV3 = await ctx.state.dposUser
  try {
    const weiAmount = new BN("" + payload.amount, 10).mul(WEI_TOKEN)
    const tier = payload.tier
    await user.delegateAsync(payload.candidate, weiAmount, tier)
    feedbackModule.showSuccess(`Success delegating ${payload.amount} tokens`)
  } catch (err) {
    feedbackModule.showError(i18n.t("messages.delegate_err_tx").toString())
  }
}
async function undelegateAsync(
  ctx: Context,
  payload: { candidate: string; amount: string; index: number },
) {
  if (!ctx.state.dposUser) {
    throw new Error("expected dposUser to be initialized")
  }
  const user: DPOSUserV3 = await ctx.state.dposUser
  const weiAmount = new BN("" + payload.amount, 10).mul(WEI_TOKEN)
  try {
    await user.undelegateAsync(payload.candidate, weiAmount, payload.index)
    feedbackModule.showSuccess(`Success un-delegating ${weiAmount} tokens`)
  } catch (err) {
    feedbackModule.showError(i18n.t("messages.undelegate_err_tx").toString())
  }
}
async function getValidatorsAsync(ctx: Context) {
  const dpos3 = await DPOSTypedStore.getDpos3({})
  const template = {
    address: "",
    active: false,
    isBootstrap: false,
    totalStaked: "0",
    personalStake: "0",
    votingPower: "0",
    delegationTotal: "0",
    delegatedStake: "0",
    name: "",
    website: "",
    description: "",
    fee: "N/A",
    newFee: "N/A",
  }
  log("getValidatorsAsync")
  // Get all validators, candidates and delegations
  const [validators, candidates, delegations] = await Promise.all([
    dpos3.getValidatorsAsync(),
    dpos3.getCandidatesAsync(),
    dpos3.getAllDelegations(),
  ])
  const nodes = candidates.map((c) =>
    Object.assign({}, template, {
      address: c.address.local.toString(),
      personalStake: c.whitelistAmount.toString(),
      votingPower: c.delegationTotal.toString(),
      delegationsTotal: c.delegationTotal.sub(c.whitelistAmount).toString(),
      active: false,
      isBootstrap: ctx.rootState.DPOS.prohibitedNodes.includes(c.name),
      name: c.name,
      website: c.website,
      description: c.description,
      fee: (c.fee.toNumber() / 100).toString(),
      newFee: (c.newFee.toNumber() / 100).toString(),
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
      personalStake: v.whitelistAmount.toString(),
      totalStaked: v.whitelistAmount.toString(), // default value for nodes without delegations
      votingPower: v.delegationTotal.toString(),
      delegationsTotal: v.delegationTotal.sub(v.whitelistAmount).toString(),
    })
  })

  delegations
    .filter((d) => d.delegationsArray.length > 0)
    .forEach((d) => {
      const addr = d.delegationsArray[0].validator.local.toString()
      const delegatedStake = d.delegationTotal
      const node = getOrCreate(addr)
      Object.assign(node, {
        delegatedStake: delegatedStake.toString(),
        totalStaked: new BN(node.personalStake).add(delegatedStake).toString(),
      })
    })
  // use the address for those without names
  nodes.filter((n) => n.name === "").forEach((n) => (n.name = n.address))
  DPOSTypedStore.setValidators(nodes)

  // return nodes
}
async function getDpos3(ctx: Context, payload: { privateKey?: string }) {
  console.log("getDpos3")
  if (ctx.state.dposUser) {
    // todo check ctx.state.dpos3 and remove it/disconnect its client
    // since we have dposUser now
    const user = await ctx.state.dposUser
    return user.dappchainDPOS
  } else if (ctx.state.dpos3) {
    DPOSTypedStore.setDappChainConnected(true)
    return ctx.state.dpos3
  }

  const networkConfig = ctx.state.chainUrls[ctx.state.networkId]

  log("networkConfig", networkConfig)

  let privateKey
  if (payload && payload.privateKey) {
    privateKey = CryptoUtils.B64ToUint8Array(payload.privateKey)
  } else {
    privateKey = CryptoUtils.generatePrivateKey()
  }

  const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey)

  const { client, address } = createDefaultClient(
    privateKeyString,
    networkConfig.dappchainEndpoint,
    networkConfig.chainId,
  )
  client.on("error", (msg) => {
    DPOSTypedStore.setDappChainConnected(false)
    console.error("PlasmaChain connection error", msg)
  })
  try {
    const dpos3 = await DPOS3.createAsync(client, address)
    log("DPOS clreated", dpos3)
    ctx.state.dpos3 = dpos3
    DPOSTypedStore.setDappChainConnected(true)
    return dpos3
  } catch (error) {
    console.error("Error creating DPOS contract", error)
    throw error
  }
}

async function initDposUser(ctx: Context) {
  console.log("initdpos user")
  if (!ctx.rootState.DPOS.web3) {
    await DPOSTypedStore.initWeb3Local()
  }
  const chainId = ctx.state.currentChain.chainId
  // set ctx.state.dposUser to be a Promise<dposUser>
  // so that components caalling it don't complain or go and try to init another dpos user...
  const user = DPOSUserV3.createEthSignMetamaskUserAsync({
    web3: ctx.rootState.DPOS.web3,
    dappchainEndpoint:
      ctx.state.chainUrls[ctx.state.networkId].dappchainEndpoint,
    chainId,
    gatewayAddress: GW_ADDRESS || ctx.state.currentChain.gatewayAddress,
    version: 1,
  }).then((u) => {
    reconfigureClient(u.client)
    log("dposUser ready")
    return u
  })
  user.catch((err) => {
    console.error(err)
    feedbackModule.showError(i18n.t("messages.init_dposUser_err_tx").toString())
  })
  // set the promise
  DPOSTypedStore.setDPOSUserV3(user)
}

// TODO: this is added to fix mismatched account mapping issues, remove once all users are fixed.
async function switchDposUser(ctx: Context, payload: { web3?: any }) {
  const privateKeyString = sessionStorage.getItem("privatekey")
  if (!privateKeyString) {
    // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
    throw new Error("No Private Key, Login again")
  }
  const network = ctx.state.networkId
  const chainId = ctx.state.currentChain.chainId
  const domainType = getDomainType()
  let user
  const opts = {
    web3: payload.web3!,
    dappchainEndpoint: ctx.state.chainUrls[ctx.state.networkId],
    chainId,
    gatewayAddress: GW_ADDRESS || GatewayJSON.networks[network].address,
    version: 1,
  }
  try {
    if (domainType === "dev" || domainType === "local") {
      user = await DPOSUserV3.createEthSignMetamaskUserAsync(opts)
    } else {
      user = await DPOSUserV3.createMetamaskUserAsync({
        ...opts,
        dappchainPrivateKey: privateKeyString,
      })
    }
  } catch (err) {
    feedbackModule.showError(i18n.t("messages.switch_dpouser_err_tx").toString())
  }
  ctx.state.dposUser = user
}

/**
 *
 * @param {store} param0
 * @param {{amount}} payload
 * @returns {Promise<TransactionReceipt>}
 */
async function withdrawAsync(ctx: Context, { amount }) {
  console.assert(ctx.state.dposUser, "Expected dposUser to be initialized")
  const user = await ctx.state.dposUser!
  const tokens = new BN("" + parseInt(amount, 10))
  const weiAmount = new BN(ctx.state.web3.utils.toWei(tokens, "ether"), 10)
  DPOSTypedStore.setGatewayBusy(true)
  try {
    const res = await user.withdrawAsync(new BN(weiAmount, 10))
    DPOSTypedStore.setGatewayBusy(false)
    return res
  } catch (err) {
    DPOSTypedStore.setGatewayBusy(false)
  }
}
/**
 *
 * @param {store} param0
 * @param {{amount}} payload
 * @returns {Promise<TransactionReceipt>}
 */
async function depositAsync(ctx: Context, { amount }) {
  const user = await requireDposUser(ctx)
  const tokens = new BN("" + parseInt(amount, 10))
  const weiAmount = new BN(ctx.state.web3.utils.toWei(tokens, "ether"), 10)
  DPOSTypedStore.setGatewayBusy(true)
  try {
    const res = user.depositAsync(new BN(weiAmount, 10))
    DPOSTypedStore.setGatewayBusy(false)
    return res
  } catch (error) {
    console.log(error)
    DPOSTypedStore.setGatewayBusy(false)
  }
}

async function approveAsync(ctx: Context, payload) {
  const user = await requireDposUser(ctx)

  const { amount } = payload
  const token = user.ethereumLoom
  const gateway = user.ethereumGateway
  DPOSTypedStore.setGatewayBusy(true)

  try {
    await token.approve(gateway.address, amount)
  } catch (error) {
    console.log(error)
  }
  DPOSTypedStore.setGatewayBusy(false)
}

function createClient(state, privateKeyString) {
  const networkConfig = state.chainUrls[state.networkId]

  const { client } = createDefaultClient(
    privateKeyString,
    networkConfig.dappchainEndpoint,
    networkConfig.chainId,
  )
  client.on("error", (msg) => {
    console.error("PlasmaChain connection error", msg)
  })

  return client
}

async function requireDposUser(ctx: Context) {
  if (!ctx.state.dposUser) {
    throw new Error("Expected dposUser to be initialized")
  }
  return await ctx.state.dposUser
}

/**
 * overrides client.middleware SignedEthTxMiddleware.Handle
 * to notify vuex when the user has to sign
 * @param client
 */
function reconfigureClient(client) {
  const middleware = client.txMiddleware.find(
    (m) => m instanceof SignedEthTxMiddleware,
  )
  if (!middleware) {
    console.warn(
      "could not find SignedEthTxMiddleware in client.middleware for reconfiguration",
    )
    return client
  }
  const handle = middleware.Handle.bind(middleware)
  middleware.Handle = async (txData) => {
    DPOSTypedStore.setShowSigningAlert(true)
    try {
      const res = await handle(txData)
      DPOSTypedStore.setShowSigningAlert(false)
      return res
    } catch (e) {
      DPOSTypedStore.setShowSigningAlert(false)
      throw e
    }
  }
  return client
}

export function addChainUrl(ctx: Context, payload: { id: string }) {
  if (ctx.state.networkId === payload.id) return
  const chains = Object.keys(ctx.state.chainUrls)
  const existingId = chains.indexOf(payload.id)
  if (existingId > -1) {
    DPOSTypedStore.setNetworkId(payload.id)
    DPOSTypedStore.setCurrentChain(ctx.state.chainUrls[payload.id])
  } else {
    return
  }
}

async function getMetamaskLoomBalance(ctx: Context) {
  const dposUser = await requireDposUser(ctx)
  try {
    log("ethereumLoom.balanceOf")
    const result = await dposUser.ethereumLoom.balanceOf(dposUser.ethAddress)
    log("ethereumLoom.balanceOf", result.toString())
    const balance = formatToCrypto(result.toString())
    const mainnetBalance = parseFloat(balance).toFixed(2)
    const userBalance = ctx.rootState.DPOS.userBalance
    DPOSTypedStore.setUserBalance(
      Object.assign(userBalance, { mainnetBalance }),
    )
    return mainnetBalance
  } catch (err) {
    feedbackModule.showError("Error getting metamask balance")
    return 0
  }
}

async function getDappchainLoomBalance(ctx: Context) {
  const user = await requireDposUser(ctx)
  const loomWei = await user.getDAppChainBalanceAsync()
  log("plasma loom balance", loomWei.toString())
  const balance = formatToCrypto(loomWei.toString())
  const userBalance = ctx.rootState.DPOS.userBalance
  const loomBalance = parseFloat(balance).toFixed(2)
  DPOSTypedStore.setUserBalance(Object.assign(userBalance, { loomBalance }))
  return loomBalance
}

async function getUnclaimedLoomTokens(ctx: Context) {
  const user = await requireDposUser(ctx)
  try {
    const unclaimAmount = await user.getUnclaimedLoomTokensAsync()
    log("unclaimed amount", unclaimAmount)
    return unclaimAmount
  } catch (err) {
    console.log("Error check unclaim loom tokens", err)
    feedbackModule.showError("Error check unclaim loom tokens")
  }
}
async function reclaimDeposit(ctx: Context) {
  const user = await requireDposUser(ctx)
  const dappchainGateway = user.dappchainGateway
  DPOSTypedStore.setGatewayBusy(true)
  try {
    await dappchainGateway.reclaimDepositorTokensAsync()
  } catch (err) {
    console.log("Error reclaiming tokens", err)
    feedbackModule.showError("Error reclaiming tokens")
  }
  DPOSTypedStore.setGatewayBusy(false)
}

async function getPendingWithdrawalReceipt(ctx: Context) {
  const user = await requireDposUser(ctx)
  try {
    const receipt = await user.getPendingWithdrawalReceiptAsync()
    if (!receipt) return null
    const signature = CryptoUtils.bytesToHexAddr(receipt.oracleSignature)
    const owner = CryptoUtils.bytesToHexAddr(receipt.tokenOwner.local.bytes)
    const amount = receipt.tokenAmount
    return { signature, amount, tokenOwner: owner }
  } catch (err) {
    console.log("Error get pending withdrawal receipt", err)
    feedbackModule.showError("Error get pending withdrawal receipt")
  }
}

async function withdrawCoinGatewayAsync(
  ctx: Context,
  payload: { amount: BN; signature: string },
) {
  const user = await requireDposUser(ctx)

  DPOSTypedStore.setGatewayBusy(true)
  log("withdrawCoinGatewayAsync", payload.amount.toString(), payload.signature)
  try {
    const result = await user.resumeWithdrawalAsync()
    DPOSTypedStore.setGatewayBusy(false)
    return result
  } catch (err) {
    DPOSTypedStore.setGatewayBusy(false)
    console.error("Error withdrawal coin from gateway", err)
    throw Error(err.message)
  }
}
async function init(ctx: Context) {
  let privateKey
  const privateKeyString = sessionStorage.getItem("privatekey")

  if (!privateKeyString) {
    // commit('setErrorMsg', 'Error, Please logout and login again', { root: true })
    return
  }

  privateKey = CryptoUtils.B64ToUint8Array(privateKeyString)
  let account

  const networkConfig = ctx.state.chainUrls[ctx.state.networkId]

  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)
  let client
  if (networkConfig.websockt) {
    client = new Client(
      networkConfig.network,
      networkConfig.websockt,
      networkConfig.queryws,
    )
  } else {
    client = new Client(
      networkConfig.network,
      createJSONRPCClient({
        protocols: [{ url: networkConfig.rpc }],
      }),
      networkConfig.queryws,
    )
  }
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey),
  ]

  account = LocalAddress.fromPublicKey(publicKey).toString()
  const localAddress = new Address(
    client.chainId,
    LocalAddress.fromPublicKey(publicKey),
  )

  DPOSTypedStore.updateState({
    account,
    localAddress,
    dAppChainClient: client,
  })
}
function showMsg(ctx: Context, payload: { type: string; msg: string }) {
  if (payload.type === "error") {
    feedbackModule.showError(payload.msg)
  } else {
    feedbackModule.showSuccess(payload.msg)
  }
}

//
// helpers
//

function getNetworkId() {
  const networkId = sessionStorage.getItem("networkId")
  const defaultId = Object.keys(networks)[0]
  return networkId || defaultId
}
// redundant ?
function getCurrentChain() {
  return networks[getNetworkId()]
}
