import { DashboardConfig } from "@/types"

export default {
  name: "stage",
  plasma: {
    networkId: "us1",
    chainId: "default",
    endpoint: "wss://test-z-us1.dappchains.com",
    blockExplorer: "https://us1-blockexplorer.devdc.io",
    loomGamesEndpoint: "https://stage.loom.games/en/dpos-link",
    historyUrl: "https://stage-api.loom.games/plasma/address/{address}?sort=-block_height",
  },
  ethereum: {
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "https://rinkeby.infura.io/5Ic91y0T9nLh6qUg33K0",
    blockExplorer: "https://rinkeby.etherscan.io",
    contracts: {
      mainGateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0xEA319a0Ea64f482060032b4BE8d9d3F7232c1214",
    },
  },
  dpos: {
    bootstrapNodes: ["0x0e99fc16e32e568971908f2ce54b967a42663a26"],
  },
  coinDataUrl: "https://stage-auth.loom.games/wallet/tokens",
  disabled: ["binance"],
  chains: ["ethereum"],
  gateway: { chains: ["ethereum"] },
} as DashboardConfig
