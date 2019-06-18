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
      if (mapping === null) {
        // todo destroy anything that needs to be disposed of
        return
      }
      if (mapping.to!.isEmpty() === false && store.state.ethereum.signer) {
        await setPlasmaAccount(mapping)
        await initializeGateways(mapping)

        const plasmaGateways = PlasmaGateways.service()
        const ethereumGateways = EthereumGateways.service()

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
    (s) => s.gateway.newMappingAgree,
    async (agree) => {
      if (agree === true) {
        // User agree to create a new mapping
        await gatewayModule.createMapping()
      }
    },
  )

  async function initializeGateways(mapping: IAddressMapping) {

    const addresses = {
      mainGateway: store.state.ethereum.contracts.mainGateway,
      loomGateway: store.state.ethereum.contracts.loomGateway,
    }
    // Initialize Ethereum gateways & coin contracts
    const ethereumGatewayService = await EthereumGateways.init(
      ethereumModule.web3,
      addresses,
    )
    const loomAddr = tokenService.getTokenAddressBySymbol("LOOM", "ethereum")
    ethereumGatewayService.add("LOOM", loomAddr)
    ethereumGatewayService.add("ETH", "") // Ether does not have a contract address

    // Init plasma side
    const plasmaGatewayService = await PlasmaGateways.init(
      plasmaModule.state.client!,
      plasmaModule.state.web3!,
      mapping,
    )

    const loomGatewayAddr = Address.fromString(`eth:${addresses.loomGateway}`)
    const ethGatewayAddr = Address.fromString(`eth:${addresses.mainGateway}`)

    plasmaGatewayService.add("ethereum", "LOOM", loomGatewayAddr)
    plasmaGatewayService.add("ethereum", "ETH", ethGatewayAddr)
  }

  /**
   * checks incomplete withdawals
   */
  async function checkIncompleteTransfers() {
    const plasmaGateways = PlasmaGateways.service()

    // TODO: Add support for multiple tokens
    const receipt = await plasmaGateways.get("ethereum", "LOOM").withdrawalReceipt()
    // @ts-ignore
    const withdrawalIsPending = JSON.parse(
      localStorage.getItem("pendingWithdrawal") || "false",
    )
    if (receipt && withdrawalIsPending) {
      gatewayModule.setWithdrawalReceipts(receipt)
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
