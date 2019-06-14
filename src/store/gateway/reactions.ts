import { HasGatewayState, EthPlasmSigner } from "./types"
import { Store } from "vuex"
import { gatewayModule } from "."
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { plasmaModule } from "../plasma"
import { Address } from "loom-js"
import BN from "bn.js"

import * as EthereumGateways from "./ethereum"
import * as PlasmaGateways from "./plasma"
import { ethereumModule } from "../ethereum"
import { DashboardState } from "@/types"
import { ERC20Gateway_v2 } from "./contracts/ERC20Gateway_v2"
import { ERC20 } from "@/store/plasma/web3-contracts/ERC20"
import { Funds } from "@/types"
import debug from "debug"
import { EventLog } from "web3-core"
import { tokenService } from "@/services/TokenService"

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
      if (mapping.to.isEmpty() && store.state.ethereum.signer) {
        await gatewayModule.createMapping()
        return
      }
      await setPlasmaAccount(mapping)
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

      plasmaGatewayService.add("LOOM", loomGatewayAddr)
      plasmaGatewayService.add("ETH", ethGatewayAddr)

      // Listen to approval & deposit events
      listenToDepositApproval(
        ethereumModule.state.address,
        ethereumGatewayService.loomGateway,
        ethereumModule.getERC20("LOOM")!,
        store,
      )

      listenToDeposit(
        ethereumModule.state.address,
        ethereumGatewayService.loomGateway,
        ethereumModule.getERC20("LOOM")!,
        store,
      )

      // TODO: Add support for multiple tokens
      const receipt = await plasmaGatewayService.get("LOOM").withdrawalReceipt()
      // @ts-ignore
      const withdrawalIsPending = JSON.parse(
        localStorage.getItem("pendingWithdrawal") || "false",
      )
      if (receipt && withdrawalIsPending) {
        gatewayModule.setWithdrawalReceipts(receipt)
      }
    },
  )

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
  store: Store<DashboardState>,
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
      gatewayModule.setShowDepositForm(false)
      gatewayModule.setShowDepositApproved(true)
      gatewayModule.setShowDepositConfirmed(false)
      gatewayModule.setPendingTransactions(payload)
      // TODO: Clear specific hash
      // gatewayModule.clearPendingTransactions()
    },
  )
}

function listenToDeposit(
  account: string,
  gw: ERC20Gateway_v2,
  loom: ERC20,
  store: Store<any>,
) {
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
      gatewayModule.setShowDepositForm(false)
      gatewayModule.setShowDepositApproved(false)
      gatewayModule.setShowDepositConfirmed(true)
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
    chain: "ethereum",
    symbol,
    weiAmount: new BN(event.returnValues.value.toString()),
  }
  return { ...event, funds }
}
