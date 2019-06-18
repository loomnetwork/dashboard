import { DashboardConfig } from "@/types"

export default {
  name: "production",
  plasma: {
    networkId: "plasma",
    chainId: "default",
    endpoint: "wss://plasma.dappchains.com",
    blockExplorer: "http://plasma-blockexplorer.dappchains.com",
    loomGamesEndpoint: "https://google.com",
  },
  ethereum: {
    networkId: "1",
    networkName: "mainnet",
    chainId: "eth",
    endpoint: "wss://mainnet.infura.io/ws",
    blockExplorer: "https://etherscan.com",
    contracts: {
      gateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
  },
  dpos: {
    bootstrapNodes: [
      "0xac3211caecc45940a6d2ba006ca465a647d8464f",
      "0x69c48768dbac492908161be787b7a5658192df35",
      "0x2a3a7c850586d4f80a12ac1952f88b1b69ef48e1",
    ],
  },
  gateway: {
    chains: ["ethereum"],
  },
  coinDataUrl: "",
  disabled: ["transfer-asset", "binance", "dev-deploy"],
  chains: ["ethereum"],
} as DashboardConfig
