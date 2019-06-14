import { DashboardConfig } from "@/types"

export default {
  name: "stage",
  plasma: {
    networkId: "us1",
    chainId: "default",
    endpoint: "wss://test-z-us1.dappchains.com",
    blockExplorer: "http://us1-blockexplorer.devdc.io",
    loomGamesEndpoint: "https://stage.loom.games/en/dpos-link",
  },
  ethereum: {
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "wss://rinkeby.infura.io/ws",
    blockExplorer: "https://rinkeby.etherscan.io",
    contracts: {
      mainGateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0xEA319a0Ea64f482060032b4BE8d9d3F7232c1214",
    },
  },
  coinDataUrl: "https://stage-auth.loom.games/wallet/tokens",
  disabled: ["binance"],
  chains: ["ethereum", "binance"],
} as DashboardConfig
