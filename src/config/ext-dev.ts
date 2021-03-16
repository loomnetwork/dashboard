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
    endpoint: `wss://rinkeby.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`,
    blockExplorer: "https://rinkeby.etherscan.io",
    contracts: {
      loomGateway: "0x63E4efDf3786EaCa967A30D2Cdc154AaDC2526E6",
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
      loom: false,
      main: true,
    },
    checkMarketplaceURL: "",
    tokenContractLogsURL: "",
    binance: {
      gatewayAccount: "tbnb1gc7azhlup5a34t8us84x6d0fluw57deuf47q9w",
      fee: 37500,
    },
    withdrawalLimit: false
  },
  disabled: [],
  chains: ["ethereum", "binance"],
  announcement: {
    validatorsPage: false,
    popup: false,
    home: false,
  },
} as DashboardConfig
