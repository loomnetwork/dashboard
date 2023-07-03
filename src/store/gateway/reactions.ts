import { ethers } from "ethers"
import { tokenService, TokenData } from "@/services/TokenService"
import { DashboardState } from "@/types"
import debug from "debug"
import { Address } from "loom-js"
import { IAddressMapping } from "loom-js/dist/contracts/address-mapper"
import { Store } from "vuex"
import { gatewayModule } from "."
import { ethereumModule } from "../ethereum"
import { plasmaModule } from "../plasma"
import * as EthereumGateways from "./ethereum"
import * as PlasmaGateways from "./plasma"
import { EthPlasmSigner } from "./signer"
import * as Sentry from "@sentry/browser"
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway"

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
      } else if (mapping.to!.isEmpty() === false) {

        Sentry.setExtra(mapping.from.chainId, mapping.from.local.toString())
        Sentry.setExtra(mapping.to.chainId, mapping.to.local.toString())

        await setPlasmaAccount(mapping)
        await initializeGateways(mapping, store.state.ethereum.gatewayVersions)

        const ethereumGateways = EthereumGateways.service()

        checkIncompleteTransfers()
      }
    },
  )

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

  async function initializeGateways(mapping: IAddressMapping, version: { loom: 1 | 2, main: 1 | 2 }) {
    const addresses = {
      mainGateway: store.state.ethereum.contracts.mainGateway,
      loomGateway: store.state.ethereum.contracts.loomGateway,
    }
    // Initialize Ethereum gateways & coin contracts
    try {
      const ethereumGateway = await EthereumGateways.init(
        ethereumModule.web3!,
        addresses,
        version,
      )
      const loomAddr = tokenService.getTokenAddressBySymbol("LOOM", "ethereum")
      ethereumGateway.add("LOOM", loomAddr)
      if (addresses.mainGateway !== ethers.constants.AddressZero) {
        ethereumGateway.add("ETH", "") // Ether does not have a contract address
      }
    } catch (error) {
      console.error("Error initializing ethereum gateways " + (error as any).message)
      return
    }

    // Init plasma side
    try {
      const plasmaGateways = await PlasmaGateways.init(
        plasmaModule.state.client!,
        plasmaModule.state.web3!,
        mapping,
        store.state.ethereum.nativeTokenSymbol === "BNB",
      )

      plasmaGateways.add("ethereum", "LOOM", Address.fromString(`eth:${addresses.loomGateway}`))
      if (addresses.mainGateway !== ethers.constants.AddressZero) {
        plasmaGateways.add("ethereum", "ETH", Address.fromString(`eth:${addresses.mainGateway}`))
      }
    } catch (error) {
      console.error("Error initializing plasma gateways " + (error as any).message)
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
