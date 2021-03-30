import { ethers } from 'ethers';
import { tokenService, TokenData } from "@/services/TokenService"
import { ERC20 } from "@/store/plasma/web3-contracts/ERC20"
import { DashboardState, Funds } from "@/types"
import BN from "bn.js"
import debug from "debug"
import { Address } from "loom-js"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { Store } from "vuex"
import { EventLog } from "web3-core"
import { gatewayModule } from "."
import { ethereumModule } from "../ethereum"
import { plasmaModule } from "../plasma"
import { EthereumGatewayV2Factory } from "loom-js/dist/mainnet-contracts/EthereumGatewayV2Factory"
import * as EthereumGateways from "./ethereum"
import * as PlasmaGateways from "./plasma"
import { EthPlasmSigner } from "./signer"
import * as Sentry from "@sentry/browser"
import { IWithdrawalReceipt } from 'loom-js/dist/contracts/transfer-gateway';

const log = debug("dash.gateway")

export function gatewayReactions(store: Store<DashboardState>) {
  store.watch(
    (s) => s.ethereum.address,
    (address) => gatewayModule.loadMapping(address),
  )

  // When we have a mapping
  // set the identity on the plasma module
  // reset ethereum and plasma gateway services
  store.watch(
    (s) => s.gateway.mapping,
    async (mapping) => {
      log(mapping)
      if (mapping === null) {
        log("null mapping")
        // todo destroy anything that needs to be disposed of
        return
      } else if (mapping.to.isEmpty()) {
        await gatewayModule.checkRelentlessUser(mapping.from.local.toString().toLowerCase())
      } else if (mapping.to!.isEmpty() === false) {

        Sentry.setExtra(mapping.from.chainId, mapping.from.local.toString())
        Sentry.setExtra(mapping.to.chainId, mapping.to.local.toString())

        await setPlasmaAccount(mapping)
        await initializeGateways(mapping, store.state.gateway.multisig)

        const ethereumGateways = EthereumGateways.service()

        // TODO: Remove this. This event listening stuff is half done, the events are fetched and
        //       then nothing actually looks at them or does anything useful,
        //       also BSC doesn't have any official websocket endpoints so this just plain doesn't
        //       work there.
        /*
        // Listen to approval & deposit events
        listenToDepositApproval(
          ethereumModule.state.address,
          ethereumGateways.loomGateway,
          ethereumModule.getERC20("LOOM")!,
        )

        listenToDeposit(
          ethereumModule.state.address,
          ethereumGateways.loomGateway,
          ethereumModule.getERC20("LOOM")!,
        )
        */
        checkIncompleteTransfers()
      }
    },
  )

  // store.watch(
  //   (s) => s.gateway.maybeRelentlessUser,
  //   async (maybeRelentlessUser) => {
  //     if (maybeRelentlessUser === false) {
  //       // User agree to create a new mapping
  //       await gatewayModule.createMapping()
  //     }
  //   },
  // )

  store.subscribeAction({
    after(action) {
      if (/^plasma.+addToken$/.test(action.type)) {
        addTokenAdapter(action.payload.token)
      }
    },
  })

  function addTokenAdapter(tokenInfo: TokenData) {
    const ethereumGateways = EthereumGateways.service()
    const plasmaGateways = PlasmaGateways.service()

    if (!ethereumGateways || !plasmaGateways) {
      return
    }

    if (tokenInfo.ethereum) {
      ethereumModule.initERC20(tokenInfo.symbol)
      log("adding gateway for %s to ethereum", tokenInfo.symbol)
      const etherumTokenAddress = tokenInfo.ethereum
      const adapter = ethereumGateways.add(tokenInfo.symbol, etherumTokenAddress)
      // @ts-ignore
      const ethGatewayAddr = Address.fromString("eth:" + adapter!.contract._address)
      plasmaGateways.add("ethereum", tokenInfo.symbol, ethGatewayAddr)
    }

    if (tokenInfo.binance) {
      log("adding gateway for %s to binance", tokenInfo.symbol)
      plasmaGateways.add("binance", tokenInfo.symbol)
      gatewayModule.refreshWithdrawalReceipt({ chain: "binance", symbol: tokenInfo.symbol })
    }
    // XXX dont refresh all allowances, just the current token
    gatewayModule.refreshAllowances()
  }

  async function initializeGateways(mapping: IAddressMapping, multisig: { loom: boolean, main: boolean }) {
    const addresses = {
      mainGateway: store.state.ethereum.contracts.mainGateway,
      loomGateway: store.state.ethereum.contracts.loomGateway,
    }
    try {
      const ethereumGateway = await EthereumGateways.init(
        ethereumModule.web3,
        addresses,
        multisig,
      )
      const loomAddr = tokenService.getTokenAddressBySymbol("LOOM", "ethereum")
      ethereumGateway.add("LOOM", loomAddr)
      if (addresses.mainGateway !== ethers.constants.AddressZero) {
        ethereumGateway.add("ETH", "") // Ether does not have a contract address
      }
    } catch (error) {
      console.error("Error initializing ethereum gateways " + error.message)
      return
    }
    // Initialize Ethereum gateways & coin contracts

    // Init plasma side
    try {
      const plasmaGateways = await PlasmaGateways.init(
        plasmaModule.state.client!,
        plasmaModule.state.web3!,
        mapping,
      )

      plasmaGateways.add("ethereum", "LOOM", Address.fromString(`eth:${addresses.loomGateway}`))
      if (addresses.mainGateway !== ethers.constants.AddressZero) {
        plasmaGateways.add("ethereum", "ETH", Address.fromString(`eth:${addresses.mainGateway}`))
      }
    } catch (error) {
      console.error("Error initializing plasma gateways " + error.message)
      return
    }

    Object.keys(store.state.plasma.coins).forEach((token) => {
      const tokenInfo = tokenService.get(token)
      if (tokenInfo) {
        addTokenAdapter(tokenInfo)
      }
    })
  }

  /**
   * checks incomplete withdawals
   */
  async function checkIncompleteTransfers() {
    const plasmaGateways = PlasmaGateways.service()
    let adapter = plasmaGateways.getGatewayAdapter("ethereum", "LOOM")
    let loomReceipt: IWithdrawalReceipt | null = null
    if (adapter) {
      loomReceipt = await adapter.withdrawalReceipt()
    }
    
    adapter = plasmaGateways.getGatewayAdapter("ethereum", "ETH")
    let mainReceipt: IWithdrawalReceipt | null = null
    if (adapter) {
      mainReceipt = await adapter.withdrawalReceipt()
    }
    // console.log("receipts", loomReceipt, mainReceipt)

    if (!loomReceipt && !mainReceipt) return
    // console.log("receipts", loomReceipt, mainReceipt)

    // Disable checking pending ethereum withdrawal transaction.
    // worse that could happen is 1 transaction succeeding and the second failing.
    const pastWithdrawalExist = false // await gatewayModule.checkIfPastWithdrawalEventExists()
    if (loomReceipt && !pastWithdrawalExist) {
      gatewayModule.setWithdrawalReceipts(loomReceipt)
      return
    }
    if (mainReceipt && !pastWithdrawalExist) {
      gatewayModule.setWithdrawalReceipts(mainReceipt)
      return
    }
  }

  /**
   * initilizes plasma account with mapped address and signer from ethereum state
   * @param mapping address mapping or null (disconnect)
   */
  async function setPlasmaAccount(mapping: IAddressMapping | null) {
    console.log("setPlasmaIdy", mapping)
    const plasmaAddress =
      mapping === null || mapping.to.isEmpty()
        ? ""
        : mapping.to.local.toString()

    const state = store.state
    console.log("set plasma address and signer if any")
    // assuming from is always ethereum
    const signer =
      state.ethereum.signer !== null
        ? new EthPlasmSigner(state.ethereum.signer!)
        : null

    await plasmaModule.changeIdentity({ signer, address: plasmaAddress })
  }
}

function listenToDepositApproval(
  account: string,
  gw: EthereumGatewayV2Factory,
  loom: ERC20,
) {
  // const approval = loom.filters.Approval(account, gw.address, null)
  loom.events.Approval(
    {
      filter: {
        from: account,
        // @ts-ignore
        to: gw.address,
      },
      fromBlock: "latest",
    },
    (error, event) => {
      if (error) {
        console.log(error)
        return
      }
      log(
        `transfer ${event.returnValues.value.toString()}
       tokens from ${event.returnValues.from} to ${event.returnValues.to}`,
      )
      const payload = formatTxFromEvent(event)
      // TODO: Uncomments if using Ethers
      gatewayModule.setPendingTransactions(payload)
      // TODO: Clear specific hash
      // gatewayModule.clearPendingTransactions()
    },
  )
}

function listenToDeposit(account: string, gw: EthereumGatewayV2Factory, loom: ERC20) {
  loom.events.Transfer(
    {
      filter: {
        from: account,
        // @ts-ignore
        to: gw.address,
      },
      fromBlock: "latest",
    },
    (error, event) => {
      if (error) {
        console.log(error)
        return
      }
      log(
        `transfer ${event.returnValues.value.toString()}
       tokens from ${event.returnValues.from} to ${event.returnValues.to}`,
      )
      const payload = formatTxFromEvent(event)
      // TODO: Uncomments if using Ethers
      gatewayModule.setPendingTransactions(payload)
      // TODO: Clear specific hash
      // gatewayModule.clearPendingTransactions()
    },
  )
}

function formatTxFromEvent(event: EventLog) {
  const contractAddr = (event.address as string).toLowerCase()
  const chain = "ethereum"
  const symbol = tokenService.tokenFromAddress(contractAddr, "ethereum")!.symbol
  const funds: Funds = {
    chain,
    symbol,
    weiAmount: new BN(event.returnValues.value.toString()),
  }
  return { ...event, funds }
}
