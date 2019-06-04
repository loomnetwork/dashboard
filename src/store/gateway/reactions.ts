import { HasGatewayState, EthPlasmSigner } from "./types"
import { Store } from "vuex"
import { gatewayModule } from "."
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { plasmaModule } from "../plasma"
import { Provider } from "ethers/providers"
import { Address } from "loom-js"

import * as EthereumGateways from "./ethereum"
import * as PlasmaGateways from "./plasma"
import { ethereumModule } from "../ethereum"
import { DashboardState } from "@/types"
import { ERC20Gateway_v2 } from 'loom-js/dist/mainnet-contracts/ERC20Gateway_v2';
import { ERC20 } from 'loom-js/dist/mainnet-contracts/ERC20';
import { log } from 'console';

export function gatewayReactions(store: Store<DashboardState>) {
  store.watch(
    (s) => s.ethereum.address,
    (newAddress) => gatewayModule.loadMapping(newAddress),
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
      // Initialize Ethereum gateways & coin contracts
      EthereumGateways.init(ethereumModule.web3)
      const ethGateway = EthereumGateways.service()
      ethGateway.add("loom", store.state.ethereum.erc20Addresses.loom)
      ethGateway.add("eth", "") // Ether does not have a contract address
      // Initialize Plasma gateways & coin contracts
      PlasmaGateways.init(
        plasmaModule.state.client,
        plasmaModule.state.web3!,
        mapping,
      )

      const loomGatewayAddr = Address.fromString(ethGateway.loomGateway.address)
      const ethGatewayAddr = Address.fromString(ethGateway.mainGateway.address)
      const plasmaGateway = PlasmaGateways.service()
      plasmaGateway.add("loom", loomGatewayAddr)
      plasmaGateway.add("eth", ethGatewayAddr)

      // Listen to approval & deposit events
      listenToDepositApproval(ethereumModule.state.address,
                            ethGateway.loomGateway.address,
                            ethereumModule.getERC20("loom"),
                            store)

      listenToDeposit(ethereumModule.state.address,
                      ethGateway.loomGateway.address,
                      ethereumModule.getERC20("loom"),
                      store)

    },
  )

  function setPlasmaAccount(mapping: IAddressMapping | null) {
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

    plasmaModule.changeIdentity({ signer, address: plasmaAddress })
  }
}

function listenToDepositApproval(
  account,
  gw: ERC20Gateway_v2,
  loom: ERC20,
  store: Store<DashboardState>,
) {
  const approval = loom.filters.Approval(account, gw.address, null)
  loom.on(approval, (from, _, weiAmount) => {
    log("approval " + weiAmount.toString() + " tokens from " + from)
    gatewayModule.setShowDepositForm(false)
    gatewayModule.setShowDepositApproved(true)
    gatewayModule.setShowDepositConfirmed(false)
    // empty pendingTx
    // todo: theoratically not necessary but test hash, we never know...
    // gatewayModule.setPendingTx(null)
  })
}

function listenToDeposit(
  account,
  gw: ERC20Gateway_v2,
  loom: ERC20,
  store: Store<any>,
) {
  const transfer = loom.filters.Transfer(account, gw.address, null)
  loom.on(transfer, (from, to, weiAmount) => {
    log(
      "transfer " + weiAmount.toString() + " tokens from " + from + " to " + to,
    )
    gatewayModule.setShowDepositForm(false)
    gatewayModule.setShowDepositApproved(false)
    gatewayModule.setShowDepositConfirmed(false)
    // gatewayModule.setPendingTx(null)
  })
}