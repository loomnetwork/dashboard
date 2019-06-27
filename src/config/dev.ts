import { DashboardConfig } from "@/types"

export default {
  name: "dev",
  plasma: {
    networkId: "asia1",
    chainId: "asia1",
    endpoint: "wss://test-z-asia1.dappchains.com",
    blockExplorer: "http://asia1-blockexplorer.devdc.io",
    loomGamesEndpoint: "https://stage.loom.games/en/dpos-link",
    historyUrl: "http://dev-api.loom.games/plasma/address/eth:{address}?sort=-block_height",
  },
  ethereum: {
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "wss://rinkeby.infura.io/ws",
    blockExplorer: "https://rinkeby.etherscan.io",
    contracts: {
      mainGateway: "0xe57e0793f953684bc9d2ef3d795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
  },
  dpos: {
    bootstrapNodes: [],
  },
  coinDataUrl: "https://dev-auth.loom.games/wallet/tokens",
  gateway: {
    chains: ["ethereum"],
    multisig: false,
  },
  disabled: [],
  chains: ["ethereum", "binance"],
} as DashboardConfig
