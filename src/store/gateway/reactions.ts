import { tokenService } from "@/services/TokenService"
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
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import * as EthereumGateways from "./ethereum"
import * as PlasmaGateways from "./plasma"
import { EthPlasmSigner } from "./signer"
import { feedbackModule } from "@/feedback/store"

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
        await setPlasmaAccount(mapping)
        await initializeGateways(mapping, store.state.gateway.multisig)

        const plasmaGateways = PlasmaGateways.service()
        const ethereumGateways = store.state.gateway.gateways.ethereum!

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

        checkIncompleteTransfers()
      }
    },
  )

  store.watch(
    (s) => s.gateway.maybeRelentlessUser,
    async (maybeRelentlessUser) => {
      if (maybeRelentlessUser === false) {
        // User agree to create a new mapping
        await gatewayModule.createMapping()
      }
    },
  )

  store.subscribeAction({
    after(action) {
      if (/^plasma.+addToken$/.test(action.type)) {
        // TDODO check if token is mapped in ethereum gateway
        ethereumModule.initERC20(action.payload)
        const ethereumGateways = store.state.gateway.gateways.ethereum!
        const ethTokenAddress = tokenService.getTokenAddressBySymbol(action.payload, "ethereum")
        const adapter = ethereumGateways.add(action.payload, ethTokenAddress)
        // tmp
        const chain = action.payload === "BNB" ? "binance" : "ethereum"
        // @ts-ignore
        PlasmaGateways.service().add(chain, action.payload, adapter!.contract._address)
      }
    },
  })

  async function initializeGateways(mapping: IAddressMapping, multisig: boolean) {
    const web3 = ethereumModule.web3
    const addresses = {
      mainGateway: store.state.ethereum.contracts.mainGateway,
      loomGateway: store.state.ethereum.contracts.loomGateway,
    }
    try {
      await gatewayModule.initEthereumGateways({
        web3,
        addresses,
        multisig,
      })
      const ethereumGateway = gatewayModule.state.gateways.ethereum!
      const loomAddr = tokenService.getTokenAddressBySymbol("LOOM", "ethereum")
      ethereumGateway.add("LOOM", loomAddr)
      ethereumGateway.add("ETH", "") // Ether does not have a contract address
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

      const loomGatewayAddr = Address.fromString(`eth:${addresses.loomGateway}`)
      const ethGatewayAddr = Address.fromString(`eth:${addresses.mainGateway}`)

      plasmaGateways.add("ethereum", "LOOM", loomGatewayAddr)
      plasmaGateways.add("ethereum", "ETH", ethGatewayAddr)
    } catch (error) {
      console.error("Error initializing plasma gateways " + error.message)
      return
    }

  }

  /**
   * checks incomplete withdawals
   */
  async function checkIncompleteTransfers() {

    const plasmaGateways = PlasmaGateways.service()

    let receipt = await plasmaGateways.get("ethereum", "LOOM").withdrawalReceipt()
    const pastWithdrawalExist = await gatewayModule.checkIfPastWithdrawalEventExists()
    // @ts-ignore
    if (receipt && !pastWithdrawalExist) {
      console.info("Setting unclaimed receipt")
      gatewayModule.setWithdrawalReceipts(receipt)
      return
    }

    // TODO: Add support for multiple tokens
    receipt = await plasmaGateways.get("ethereum", "ETH").withdrawalReceipt()
    // @ts-ignore
    if (receipt || !pastWithdrawalExist) {
      gatewayModule.setWithdrawalReceipts(receipt)
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
  gw: ERC20Gateway_v2,
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
      log(
        `transfer ${event.returnValues.value.toString()}
       tokens from ${event.returnValues.from} to ${event.returnValues.to}`,
      )
      const payload = formatTxFromEvent(event)
      // TODO: Uncomments if using Ethers
      // gatewayModule.setShowDepositApproved(true)
      gatewayModule.setPendingTransactions(payload)
      // TODO: Clear specific hash
      // gatewayModule.clearPendingTransactions()
    },
  )
}

function listenToDeposit(account: string, gw: ERC20Gateway_v2, loom: ERC20) {
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
      log(
        `transfer ${event.returnValues.value.toString()}
       tokens from ${event.returnValues.from} to ${event.returnValues.to}`,
      )
      const payload = formatTxFromEvent(event)
      // TODO: Uncomments if using Ethers
      // gatewayModule.setShowDepositApproved(false)
      // gatewayModule.setShowDepositConfirmed(true)
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
