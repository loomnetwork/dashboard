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
    portisKey: "10589118-6329-43a0-818c-93800c206786",
    formaticKey: "pk_test_58DB7D96C460470B",
  },
  dpos: {
    bootstrapNodes: ["0x0e99fc16e32e568971908f2ce54b967a42663a26"],
    analyticsUrl: "//stage-api.loom.games",
  },
  coinDataUrl: "/tokens/stage.tokens.json",
  disabled: [],
  chains: ["ethereum", "binance"],
  gateway: {
    chains: ["ethereum", "binance"],
    multisig: true,
    checkMarketplaceURL: "https://stage-auth.loom.games/wallet/address?address={address}&wallet=eth",
    binance: {
      gatewayAccount: "tbnb1kzsnp502agsuqw5e8kdh0v2csg4elgaxc4gvxz",
      fee: 37500,
    },
    tokenContractLogsURL: "https://stage-api.loom.games/plasma/tokencontract/eth:{address}",
  },
  announcements: {
    home: true,
  },
} as DashboardConfig
