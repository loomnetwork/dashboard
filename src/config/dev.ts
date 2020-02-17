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
      mainGateway: "0xa6BaAA13CD9d027e15Ae219C90b90991Af373796",
      loomGateway: "0x065F7D2636880aE34a98dD7600b9bD1D5EcAFA97",
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
    multisig: {
      loom: true,
      main: true,
    },
    checkMarketplaceURL: "https://dev-auth.loom.games/wallet/address?address={address}&wallet=eth",
    binance: {
      gatewayAccount: "tbnb14sa7gnlalxd0e336clc0ltgke6e6hdanyl6pqq",
      fee: 37500,
    },
    tokenContractLogsURL: "https://dev-api.loom.games/plasma/tokencontract/eth:{address}",
    withdrawalLimit: true
  },
  disabled: [],
  chains: ["ethereum", "binance"],
  announcement: {
    validatorsPage: false,
    popup: false,
    home: false,
  },
} as DashboardConfig
