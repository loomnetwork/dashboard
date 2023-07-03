import { DashboardConfig } from "@/types"

export default {
  name: "local",
  plasma: {
    networkId: "default",
    chainId: "default",
    endpoint: "ws://localhost:46658",
    blockExplorer: "",
    loomGamesEndpoint: "https://localhost:8000/",
    historyUrl: "https://stage.loom.games/{address}",
  },
  ethereum: {
    networkId: "default",
    networkName: "Ganache",
    genericNetworkName: "Ethereum",
    endpoint: "ws://localhost:8484",
    blockExplorer: "",
    blockExplorerApi: "",
    chainId: "eth",
    nativeTokenSymbol: "ETH",
    nativeTokenDecimals: 18,
    contracts: {
      gateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
    gatewayVersions: {
      loom: 2,
      main: 2,
    },
  },
  dpos: {
    bootstrapNodes: [],
    analyticsUrl: "//dev-api.loom.games",
  },
  gateway: {
    chains: ["ethereum"],
    tokenContractLogsURL: "https://dev-api.loom.games/plasma/tokencontract/eth:{address}",
    binance: {
      gatewayAccount: "tbnb14sa7gnlalxd0e336clc0ltgke6e6hdanyl6pqq",
      fee: 37500,
    },
    withdrawalLimit: true,
  },
  coinDataUrl: "",
  disabled: [],
  chains: ["ethereum"],
  announcement: {
    validatorsPage: false,
    popup: false,
    home: false,
  },
  features: {
    bscWallets: true,
  },
} as DashboardConfig
