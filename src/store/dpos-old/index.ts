import axios from 'axios'
const { CryptoUtils, LocalAddress } = require('loom-js')
import { formatToCrypto } from '../../utils'
import { initWeb3 as web3init } from '../../services/initWeb3'
import Web3 from 'web3'

import {ethers} from "ethers"

import Debug from "debug"
import { DPOS3 } from 'loom-js/dist/contracts';
import { DPOSUserV3, Address, Client } from 'loom-js';
import BN from "bn.js"
import { DashboardState, DposState } from '@/types';
import { Log } from 'ethers/providers';
import { getStoreBuilder } from 'vuex-typex';


import * as getters from "./getters"
import * as mutations from "./mutations"
import { dynamicSort } from '@/utils';

Debug.enable("dashboard.dpos")
const debug = Debug("dashboard.dpos")

const DAILY_WITHDRAW_LIMIT = 500000



const defaultState = () => {
  return {
    isLoggedIn: false,
    showSidebar: true,
    connectedToMetamask: false,
    web3: undefined,
    currentMetamaskAddress: undefined,
    history: null,
    withdrawLimit: DAILY_WITHDRAW_LIMIT,
    validators: [],
    status: "check_mapping",
    walletType: undefined,
    selectedAccount: undefined,
    metamaskDisabled: false,
    showLoadingSpinner: false,
    showSignWalletModal: false,
    showAlreadyMappedModal: false,
    mappingSuccess: false,
    gatewayBusy: false,
    userBalance: {
      isLoading: false,
      loomBalance: null,
      mainnetBalance: null,
      stakedAmount: null
    },
    rewardsResults: null,
    timeUntilElectionCycle: null,
    // timestamp millis
    nextElectionTime: 0,
    validatorFields: [
      { key: 'Name', sortable: true },
      { key: 'Status', sortable: true },
      { key: 'totalStaked', sortable: true, label: "Total Staked" },
      // { key: 'votingPower', sortable: true, label: "Reward Power" },
      // { key: 'Weight', sortable: true },
      { key: 'Fees', sortable: true },
      // { key: 'Uptime', sortable: true },
      // { key: 'Slashes', sortable: true },
    ],
    prohibitedNodes: ["plasma-0", "plasma-1", "plasma-2", "plasma-3", "plasma-4", "plasma-5", "Validator #4", "test-z-us1-dappchains-2-aws0"],
    latestBlockNumber: undefined,
    cachedEvents: [],
    dappChainEventUrl: "//dev-api.loom.games/plasma/address",
    historyPromise: null,
    dappChainEvents: [],
    states: ["Bonding", "Bonded", "Unbounding", "Redelegating"],
    delegations: [],
    dashboardPrivateKey: "nGaUFwXTBjtGcwVanY4UjjzMVJtb0jCUMiz8vAVs8QB+d4Kv6+4TB86dbJ9S4ghZzzgc6hhHvhnH5pdXqLX4CQ==",
    dashboardAddress: "0xcfa12adc558ea05d141687b8addc5e7d9ee1edcf",
    analyticsEndpoint: "//dev-api.loom.games",
    client: null,
    mapper: null,
    analyticsData: null,
    showDepositForm: false,
    showDepositApproved: false,
    showDepositConfirmed: false,
    pendingTx: null,
  } as DposState
}


const builder = getStoreBuilder<DashboardState>().module("DPOS", defaultState())
const stateGetter = builder.state()

export const DPOSTypedStore = {
  get state() { return stateGetter() },

  // getters
  getLatestBlockNumber: builder.read(getters.getLatestBlockNumber),
  getCachedEvents: builder.read(getters.getCachedEvents),
  getDashboardAddressAsLocalAddress: builder.read(getters.getDashboardAddressAsLocalAddress),
  getFormattedValidators: builder.read(getters.getFormattedValidators),

  // mutations
  setIsLoggedIn:          builder.commit(mutations.setIsLoggedIn),
  setShowSidebar:         builder.commit(mutations.setShowSidebar),
  setConnectedToMetamask: builder.commit(mutations.setConnectedToMetamask),
  setWeb3:                builder.commit(mutations.setWeb3),
  setUserBalance:         builder.commit(mutations.setUserBalance),
  setValidators:          builder.commit(mutations.setValidators),
  setCurrentMetamaskAddress: builder.commit(mutations.setCurrentMetamaskAddress),
  setStatus: builder.commit(mutations.setStatus),
  setMetamaskDisabled: builder.commit(mutations.setMetamaskDisabled),
  setShowLoadingSpinner: builder.commit(mutations.setShowLoadingSpinner),
  setSignWalletModal: builder.commit(mutations.setSignWalletModal),
  setAlreadyMappedModal: builder.commit(mutations.setAlreadyMappedModal),
  setMappingSuccess: builder.commit(mutations.setMappingSuccess),
  setRewardsResults: builder.commit(mutations.setRewardsResults),
  setTimeUntilElectionCycle: builder.commit(mutations.setTimeUntilElectionCycle),
  setNextElectionTime: builder.commit(mutations.setNextElectionTime),
  setWalletType: builder.commit(mutations.setWalletType),
  setSelectedAccount: builder.commit(mutations.setSelectedAccount),
  setLatesBlockNumber: builder.commit(mutations.setLatesBlockNumber),
  setCachedEvents: builder.commit(mutations.setCachedEvents),
  setSelectedLedgerPath: builder.commit(mutations.setSelectedLedgerPath),
  setGatewayBusy: builder.commit(mutations.setGatewayBusy),
  setHistoryPromise: builder.commit(mutations.setHistoryPromise),
  setDappChainEvents: builder.commit(mutations.setDappChainEvents),
  setClient: builder.commit(mutations.setClient),
  setMapper: builder.commit(mutations.setMapper),
  setAnalyticsData: builder.commit(mutations.setAnalyticsData),
  setDelegations: builder.commit(mutations.setDelegations),
  setShowDepositForm: builder.commit(mutations.setShowDepositForm),
  setShowDepositApproved: builder.commit(mutations.setShowDepositApproved),
  setShowDepositConfirmed: builder.commit(mutations.setShowDepositConfirmed),
  setPendingTx: builder.commit(mutations.setPendingTx),

  // actions
  initializeDependencies: builder.dispatch(initializeDependencies),
  checkMappingAccountStatus: builder.dispatch(checkMappingAccountStatus),
  storePrivateKeyFromSeed: builder.dispatch(storePrivateKeyFromSeed),
  clearPrivateKey: builder.dispatch(clearPrivateKey),
  checkIfConnected: builder.dispatch(checkIfConnected),
  initWeb3Local: builder.dispatch(initWeb3Local),
  initWeb3: builder.dispatch(initWeb3),
  getValidatorList: builder.dispatch(getValidatorList),
  checkAllDelegations: builder.dispatch(checkAllDelegations),
  consolidateDelegations: builder.dispatch(consolidateDelegations),
  queryRewards: builder.dispatch(queryRewards),
  claimRewardsAsync: builder.dispatch(claimRewardsAsync),
  getTimeUntilElectionsAsync: builder.dispatch(getTimeUntilElectionsAsync),
  redelegateAsync: builder.dispatch(redelegateAsync),
  fetchDappChainEvents: builder.dispatch(fetchDappChainEvents),
  fetchAnalyticsData: builder.dispatch(fetchAnalyticsData),
  loadEthereumHistory: builder.dispatch(loadEthereumHistory),
  updateDailyWithdrawLimit: builder.dispatch(updateDailyWithdrawLimit),
  approveDeposit: builder.dispatch(approveDeposit),
  executeDeposit: builder.dispatch(executeDeposit),
}



// actions




import { BareActionContext } from "vuex-typex";
import { DappChainTypedModule } from '../dappchain';
declare type Context = BareActionContext<DposState, DashboardState>

async function initializeDependencies(ctx:Context, payload) {
  DPOSTypedStore.setShowLoadingSpinner(true);
  try {
    await DPOSTypedStore.initWeb3Local();
    await DappChainTypedModule.ensureIdentityMappingExists(null);
    await DPOSTypedStore.checkMappingAccountStatus;
    await DappChainTypedModule.initDposUser(  null );
  } catch (err) {
    if (err.message === "no Metamask installation detected") {
      DPOSTypedStore.setMetamaskDisabled(true);;
    }
    commit(
      "setErrorMsg",
      {
        msg: "An error occurred, please refresh the page",
        forever: false,
        report: true,
        cause: err
      },
      { root: true }
    );
    DPOSTypedStore.setShowLoadingSpinner(false);
    throw err;
  }
  DPOSTypedStore.setShowLoadingSpinner(false);
}
async function checkMappingAccountStatus(ctx:Context) {
  DPOSTypedStore.setSignWalletModal(false);;
  DPOSTypedStore.setAlreadyMappedModal(false);;
  if (ctx.state.status == "no_mapping" && ctx.state.mappingError == undefined) {
    try {
      DPOSTypedStore.setSignWalletModal(true);;
      DPOSTypedStore.setShowLoadingSpinner(true);
      await DappChainTypedModule.createNewPlasmaUser(  null );
      // await DappChainTypedModule.addMappingAsync(  null )
      DPOSTypedStore.setShowLoadingSpinner(false);
      DPOSTypedStore.setMappingSuccess(true);;
      DPOSTypedStore.setSignWalletModal(false);;
    } catch (err) {
      console.log("add mapping async error", err);
      DPOSTypedStore.setSignWalletModal(false);;
      if (err.message.includes("identity mapping already exists")) {
        DPOSTypedStore.setAlreadyMappedModal(true);;
      } else {
        commit(
          "setErrorMsg",
          { msg: err.message, forever: false, report: true, cause: err },
          { root: true }
        );
      }
    }
  } else if (ctx.state.status == "no_mapping" && ctx.state.mappingError !== undefined) {
    DPOSTypedStore.setSignWalletModal(false);;
    // if (err.message.includes("identity mapping already exists")) {
    //   DPOSTypedStore.setAlreadyMappedModal(true);
    // } else {
    //   commit("setErrorMsg", {msg: err.message, forever: false, report: true, cause: err}, { root: true })
    // }
  } else if (ctx.state.status == "mapped") {
    DPOSTypedStore.setMappingSuccess(true);
  }
  DPOSTypedStore.setShowLoadingSpinner(false);
}
async function storePrivateKeyFromSeed(ctx, payload) {
  const privateKey = CryptoUtils.generatePrivateKeyFromSeed(
    payload.seed.slice(0, 32)
  );
  const privateKeyString = CryptoUtils.Uint8ArrayToB64(privateKey);
  sessionStorage.setItem("privatekey", privateKeyString);
  DPOSTypedStore.setIsLoggedIn(true);;
}
async function clearPrivateKey(ctx, payload) {
  sessionStorage.removeItem("privatekey");
  DPOSTypedStore.setIsLoggedIn(false);;
}
async function checkIfConnected(ctx:Context) {
  if (!ctx.state.web3) await DPOSTypedStore.initWeb3();
}
// broken
async function initWeb3Local(ctx:Context) {
  if (ctx.state.walletType === "metamask") {
    let web3js:Web3 = await web3init();
    let accounts = await web3js.eth.getAccounts();
    let metamaskAccount = accounts[0];
    DPOSTypedStore.setWeb3(web3js);
    DPOSTypedStore.setCurrentMetamaskAddress(metamaskAccount);
  } else if (ctx.state.walletType === "ledger") {
    if (ctx.state.selectedLedgerPath) {
      // let web3js = await initWeb3SelectedWallet(ctx.state.selectedLedgerPath)
      // DPOSTypedStore.setWeb3(web3js);
    } else {
      console.error("no HD path selected");
      throw new Error("No HD path selected");
    }
  }
  DPOSTypedStore.setConnectedToMetamask(true);;
  await DappChainTypedModule.init( null );
  await dispatch(
    "DappChain/registerWeb3",
    { web3: ctx.state.web3 },
    { root: true }
  );
}

async function initWeb3(ctx:Context) {
  let web3js;
  // @ts-ignore
  if (window.ethereum) {
    // @ts-ignore
    window.web3 = new Web3(ethereum);
    // @ts-ignore
    web3js = new Web3(ethereum);
    try {
      // @ts-ignore
      await ethereum.enable();
    } catch (err) {
      dispatch("setError", "User denied access to Metamask", { root: true });
      return;
    }
    // @ts-ignore
  } else if (window.web3) {
    // @ts-ignore
    window.web3 = new Web3(window.web3.currentProvider);
    // @ts-ignore
    web3js = new Web3(window.web3.currentProvider);
  } else {
    dispatch("setError", "Metamask is not Enabled", { root: true });
  }
  DPOSTypedStore.setWeb3(web3js);;
}
/**
 * @deprecated use get state.DappChain.validators which is automatically refreshed
 * when needed
 * @param {*} param0
 */
async function getValidatorList(ctx:Context) {
  try {
    const validators = await dispatch("DappChain/getValidatorsAsync", null, {
      root: true
    });
    if (validators.length === 0) {
      return null;
    }
    const validatorList: any[] = [];
    for (let i in validators) {
      const validator = validators[i];

      let weight = 0;
      if (validator.isBootstrap) {
        weight = 1;
      } else if (validator.name === "") {
        weight = 2;
      }

      // Check if bootstrap val
      const validatorName =
        validator.name !== "" ? validator.name : validator.address;
      const isBootstrap = validator.isBootstrap;
      validatorList.push({
        Address: validator.address,
        // Active / Inactive validator
        Status: validator.active ? "Active" : "Inactive",
        totalStaked: formatToCrypto(validator.totalStaked),
        delegationsTotal: formatToCrypto(validator.delegationsTotal),
        personalStake: formatToCrypto(validator.personalStake),
        delegatedStake: formatToCrypto(validator.delegatedStake),
        // Whitelist + Tokens Staked * Bonuses
        votingPower: formatToCrypto(validator.votingPower || 0),
        // Validator MEtadata
        Name: validatorName,
        Description: validator.description || null,
        Website: validator.website || null,
        Fees: isBootstrap ? "N/A" : (validator.fee || "0") + "%",
        isBootstrap,
        Weight: weight || 0,
        _cellVariants: {
          Status: validator.active ? "active" : "inactive",
          Name: isBootstrap ? "danger" : undefined
        }
      });
    }
    validatorList.sort(dynamicSort("Weight"));
    DPOSTypedStore.setValidators(validatorList);;
  } catch (err) {
    console.error(err);
    DPOSTypedStore.setValidators([]);
    dispatch(
      "setError",
      { msg: "Fetching validators failed", report: true, cause: err },
      { root: true }
    );
  }
}
async function checkAllDelegations(ctx:Context) {
  console.assert(
    !!ctx.rootState.DappChain.dposUser,
    "expected dposUser to be initialised"
  );
  const dposUser: DPOSUserV3 = await ctx.rootState.DappChain.dposUser!;

  debug("checkAllDelegationsAsync");
  const {
    amount,
    weightedAmount,
    delegationsArray
  } = await dposUser.checkAllDelegationsAsync();
  debug("delegations", delegationsArray);
  let filteredDelegations = delegationsArray
    // delegation with index 0 represents rewards
    .filter(d => d.index > 0)
    .filter(d => !(d.amount.isZero() && d.updateAmount.isZero()))
    // add string address to make it easy to compare
    .map(d =>
      Object.assign(d, {
        validatorStr: d.validator.local.toString()
      })
    );
  const userBalance = ctx.state.userBalance;
  const stakedAmount = formatToCrypto(weightedAmount.toString());
  DPOSTypedStore.setDelegations(filteredDelegations);
  DPOSTypedStore.setUserBalance(Object.assign(userBalance, { stakedAmount }));
}
async function consolidateDelegations(ctx:Context, validator) {
  console.assert(
    !!ctx.rootState.DappChain.dposUser,
    "expected dposUser to be initialised"
  );
  const dposUser: DPOSUserV3 = await ctx.rootState.DappChain.dposUser!;
  const address = Address.fromString(
    `${dposUser.client.chainId}:${validator.address}`
  );
  debug("consolidateDelegations");
  await dposUser.dappchainDPOS.consolidateDelegations(address);
}
async function queryRewards(ctx:Context) {
  if (!ctx.rootState.DappChain.dposUser) {
    throw new Error("Expected dposUser to be initialized");
  }

  const user: DPOSUserV3 = await ctx.rootState.DappChain.dposUser!;
  try {
    debug("queryRewards");
    const result = await user.checkRewardsAsync();
    const formattedResult = formatToCrypto(result);
    DPOSTypedStore.setRewardsResults(formattedResult);
  } catch (err) {
    if (err.message.includes("Distribution record not found")) {
      DPOSTypedStore.setRewardsResults(0);
    } else {
      commit(
        "setErrorMsg",
        {
          msg: "Failed querying rewards",
          forever: false,
          report: true,
          cause: err
        },
        { root: true }
      );
    }
  }
}

async function claimRewardsAsync({ rootState }) {
  if (!rootState.DappChain.dposUser) {
    throw new Error("Expected dposUser to be initialized");
  }
  const user: DPOSUserV3 = await rootState.DappChain.dposUser;
  try {
    debug("claimRewardsAsync");
    await user.claimRewardsAsync();
  } catch (err) {
    console.error(err);
  }
}
// this can be moved out as is automatically called once dposUser is set
// actually instead of depending on dposUser we should depend on dpos contract
// (if we want to display timer in "anonymous" session)
async function getTimeUntilElectionsAsync(ctx:Context) {
  debug("getTimeUntilElectionsAsync");
  const dpos: DPOS3 = await dispatch("DappChain/getDpos3", null, {
    root: true
  });
  try {
    const result: BN = await dpos.getTimeUntilElectionAsync();
    debug("next election in %s seconds", result.toNumber());
    DPOSTypedStore.setTimeUntilElectionCycle("" + result.toNumber());
    DPOSTypedStore.setNextElectionTime(Date.now() + result.toNumber() * 1000); //Date.now() + (result.toNumber()*1000))
  } catch (err) {
    console.error(err);
  }
}

async function redelegateAsync(ctx:Context, payload) {
  if (!ctx.rootState.DappChain.dposUser) {
    throw new Error("Expected dposUser to be initialized");
  }

  const { origin, target, amount, index } = payload;
  const user = await ctx.rootState.DappChain.dposUser;

  try {
    await user.redelegateAsync(origin, target, amount, index);
    commit(
      "setSuccessMsg",
      { msg: "Success redelegating stake", forever: false },
      { root: true }
    );
  } catch (err) {
    console.error(err);
    commit(
      "setErrorMsg",
      {
        msg: "Failed to redelegate stake",
        forever: false,
        report: true,
        cause: err
      },
      { root: true }
    );
  }
}

async function fetchDappChainEvents(ctx:Context) {
  let historyPromise = axios.get(
    `${ctx.state.dappChainEventUrl}/eth:${
      ctx.state.currentMetamaskAddress
    }?sort=-block_height`
  );
  // Store the unresolved promise
  DPOSTypedStore.setHistoryPromise(historyPromise);

  historyPromise
    .then(response => {
      return response.data.txs
        .filter(tx => {
          // Filter based on these events
          if (
            tx.topic === "event:WithdrawLoomCoin" ||
            tx.topic === "event:MainnetDepositEvent" ||
            tx.topic === "event:MainnetWithdrawalEvent"
          ) {
            return tx;
          }
        })
        .map(tx => {
          let type = "";
          switch (tx.topic) {
            case "event:MainnetDepositEvent":
              type = "Deposit";
              break;
            case "event:MainnetWithdrawalEvent":
              type = "Withdraw";
              break;
            case "event:WithdrawLoomCoin":
              type = "Withdraw Begun";
              break;
            default:
              break;
          }

          let amount = tx.token_amount;

          // Return events in this format
          return {
            "Block #": tx.block_height,
            Event: type,
            Amount: formatToCrypto(amount),
            "Tx Hash": tx.tx_hash
          };
        });
    })
    .catch(err => {
      console.error(err);
    })
    .then(results => {
      DPOSTypedStore.setDappChainEvents(results);;
    });
}

async function fetchAnalyticsData(ctx:Context) {
  // TODO: Uncomment to use .env
  // let url = process.env.VUE_APP_ANALYTICS_URL
  // let dataPromise = await axios.get(url + "/delegation/total?from_date&to_date")
  let url = ctx.state.analyticsEndpoint;
  let data = await axios.get(
    url + "/delegation/total?from_date&to_date"
  );
  DPOSTypedStore.setAnalyticsData(data);
}
async function loadEthereumHistory(ctx:Context) {
  debug("loadEthereumHistory");
  if (!ctx.rootState.DappChain.dposUser) {
    console.warn("no dposUser for which to call history");
    return;
  }
  const user: DPOSUserV3 = await ctx.rootState.DappChain.dposUser!;
  const loom = user.ethereumLoom;
  const gateway = user.ethereumGateway;
  const provider = user.ethereumGateway.provider;
  const cachedEvents = DPOSTypedStore.getCachedEvents();
  // Get latest mined block from Ethereum
  const depositFilter = loom.filters.Transfer(
    user.ethAddress,
    gateway.address,
    null
  );
  const withdrawFilter = loom.filters.Transfer(
    gateway.address,
    user.ethAddress,
    null
  );
  let deposits: Log[];
  let withdraws: Log[];
  let toBlock;
  try {
    deposits = await loom.provider.getLogs(depositFilter);
    withdraws = await loom.provider.getLogs(withdrawFilter);
    toBlock = await provider.getBlockNumber();
  } catch (e) {
    console.error(e);
    return [];
  }

  const history = deposits
    .map(entry => ({
      "Block #": entry.blockNumber!,
      Event: "Deposit",
      Amount: formatToCrypto(entry.topics[2]),
      "Tx Hash": entry.transactionHash
    }))
    .concat(
      withdraws.map(entry => ({
        "Block #": entry.blockNumber!,
        Event: "Withdraw",
        Amount: formatToCrypto(entry.topics[2]),
        "Tx Hash": entry.transactionHash
      }))
    )
    .sort((a, b) => a["Block #"] - b["Block #"]);

  const mergedEvents:any[] = cachedEvents.concat(history);
  DPOSTypedStore.setLatesBlockNumber(toBlock);
  DPOSTypedStore.setCachedEvents(mergedEvents);
  debug("ethereum history", mergedEvents);
  return mergedEvents;
}

async function updateDailyWithdrawLimit(ctx:Context, history) {
  // TODO externalise this
  const limit = history
    .filter(item => item.Event === "Withdraw") // and date is today
    .reduce(
      (left, item) => left - parseInt(item.Amount, 10),
      DAILY_WITHDRAW_LIMIT
    );
  ctx.state.withdrawLimit = Math.max(0, limit);
  debug("ctx.state.withdrawLimit", ctx.state.withdrawLimit);
  return ctx.state.withdrawLimit;
}
/**
 * sends an approval request and does not wait for a confirmation
 * as we listen to confirmations on the contract
 * @param {*} param0
 * @param {*} tokenAmount
 * @see dposPlugin
 */
async function approveDeposit(ctx:Context, tokenAmount) {
  console.assert(
    ctx.rootState.DappChain.dposUser,
    "Expected dposUser to be initialized"
  );
  const dposUser = await ctx.rootState.DappChain.dposUser!;
  const loom = dposUser.ethereumLoom;
  const gw = dposUser.ethereumGateway;
  const wei = ethers.utils.parseEther("" + tokenAmount);
  debug("approve", gw.address, wei.toString(), wei);
  return executeTx(
    "deposit approval", 
    () => loom.functions.approve(gw.address, wei.toString())
  );
}
/**
 * deposits amount: min(allowance, floor(ballance))
 * if amount > 0
 * todo handle error
 *
 * @param {Store} param0
 * @param {ethers.utils.BigNumber} weiAmount
 */
async function executeDeposit(ctx:Context) {
  console.assert(
    ctx.rootState.DappChain.dposUser,
    "Expected dposUser to be initialized"
  );
  const dposUser = await ctx.rootState.DappChain.dposUser!;
  const loom = dposUser.ethereumLoom;
  const gw = dposUser.ethereumGateway;
  const account = dposUser.ethAddress;
  const rawAmount = await Promise.all([
    loom.balanceOf(account),
    loom.allowance(account, gw.address)
  ]).then(([balance, allowance]) => {
    debug("balance %s allowance %s", balance.toString(), allowance.toString());
    return allowance.lt(balance) ? allowance : balance;
  });

  // rounding...
  const amount = rawAmount.sub(rawAmount.mod(ethers.constants.WeiPerEther));
  if (amount.isZero()) {
    throw new Error("No allowance or insufisient funds");
  }
  debug("depositERC20 %s ", amount.toString(), loom.address);

  await executeTx("deposit", () =>
    gw.functions.depositERC20(amount.toString(), loom.address)
  );
}

async function executeTx(type:string, fn) {
  const pendingTx = { type, hash: "" };
  DPOSTypedStore.setGatewayBusy(true);;
  try {
    const tx = await fn();
    debug("pending tx", tx.hash);
    pendingTx.hash = tx.hash;
  } catch (err) {
    // imToken funky output
    if (err.transactionHash) {
      pendingTx.hash = err.transactionHash;
    } else {
      DPOSTypedStore.setGatewayBusy(false);
      throw err;
    }
  }

  DPOSTypedStore.setPendingTx(pendingTx);
  DPOSTypedStore.setGatewayBusy(false);
}
