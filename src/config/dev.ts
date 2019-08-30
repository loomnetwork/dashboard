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
    portisKey: "10589118-6329-43a0-818c-93800c206786",
    formaticKey: "pk_test_58DB7D96C460470B",
  },
  dpos: {
    bootstrapNodes: [],
    analyticsUrl: "//dev-api.loom.games",
  },
  coinDataUrl: "/tokens/dev.tokens.json",
  gateway: {
    chains: ["ethereum"],
    multisig: false,
    checkMarketplaceURL: "https://dev-auth.loom.games/wallet/address?address={address}&wallet=eth",
    binance: {
      gatewayAccount: "tbnb14sa7gnlalxd0e336clc0ltgke6e6hdanyl6pqq",
      fee: 37500,
    },
    tokenContractLogsURL: "https://dev-api.loom.games/plasma/tokencontract/eth:{address}",
  },
  disabled: [],
  chains: ["ethereum", "binance"],
  announcements: {
    home: true,
  },
} as DashboardConfig
