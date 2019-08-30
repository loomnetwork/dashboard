import { DashboardConfig } from "@/types"

export default {
  name: "ext-dev",
  plasma: {
    networkId: "extdev-plasma-us1",
    chainId: "extdev-plasma-us1",
    endpoint: "wss://extdev-plasma-us1.dappchains.com",
    blockExplorer: "http://asia1-blockexplorer.devdc.io",
    loomGamesEndpoint: "https://stage.loom.games/en/dpos-link",
    historyUrl: "http://dev-api.loom.games/plasma/address/eth:{address}?sort=-block_height",
  },
  ethereum: {
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "https://rinkeby.infura.io/5Ic91y0T9nLh6qUg33K0",
    blockExplorer: "https://rinkeby.etherscan.io",
    contracts: {
      loomGateway: "0x5558ba31CB91b2a45B3DCe9c720A0e0b59785711",
      mainGateway: "0xb73C9506cb7f4139A4D6Ac81DF1e5b6756Fab7A2",
    },
    portisKey: "10589118-6329-43a0-818c-93800c206786",
    formaticKey: "pk_test_58DB7D96C460470B",
  },
  dpos: {
    bootstrapNodes: [],
    analyticsUrl: "//dev-api.loom.games",
  },
  coinDataUrl: "/tokens/ext-dev.tokens.json",
  gateway: {
    chains: ["ethereum", "binance"],
    multisig: false,
    checkMarketplaceURL: "https://dev-auth.loom.games/wallet/address?address={address}&wallet=eth",
    tokenContractLogsURL: "",
    binance: {
      gatewayAccount: "tbnb14sa7gnlalxd0e336clc0ltgke6e6hdanyl6pqq",
      fee: 37500,
    },
  },
  disabled: [],
  chains: ["ethereum", "binance"],
  announcement: {
    popup: true,
  },
} as DashboardConfig
