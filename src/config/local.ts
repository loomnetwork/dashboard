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
    endpoint: "ws://localhost:8484",
    blockExplorer: "",
    chainId: "eth",
    contracts: {
      gateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
  },
  dpos: {
    bootstrapNodes: [],
  },
  gateway: {
    chains: ["ethereum"],
    multisig: true,
    checkMarketplaceURL: "https://dev-auth.loom.games/wallet/address?address={address}&wallet=eth",
    tokenContractLogsURL: "https://dev-api.loom.games/plasma/tokencontract/eth:{address}",
  },
  coinDataUrl: "",
  disabled: [],
  chains: ["ethereum"],
} as DashboardConfig
