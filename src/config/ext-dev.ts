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
      loomGateway: "0xc6e1421720c7f62455c053bc8326633d68c01c00",
      mainGateway: "0x9c67fd4eaf0497f9820a3fbf782f81d6b6dc4baa",
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
    multisig: {
      loom: true,
      main: true,
    },
    checkMarketplaceURL: "https://dev-auth.loom.games/wallet/address?address={address}&wallet=eth",
    tokenContractLogsURL: "",
    binance: {
      gatewayAccount: "tbnb1gc7azhlup5a34t8us84x6d0fluw57deuf47q9w",
      fee: 37500,
    },
  },
  disabled: [],
  chains: ["ethereum", "binance"],
  announcement: {
    validatorsPage: true,
    popup: true,
    home: true,
  },
} as DashboardConfig
