import { DashboardConfig } from "@/types"
import { ethers } from "ethers"

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
    genericNetworkName: "Ethereum",
    chainId: "eth",
    nativeTokenSymbol: "ETH",
    nativeTokenDecimals: 18,
    endpoint: `wss://rinkeby.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`,
    blockExplorer: "https://rinkeby.etherscan.io",
    blockExplorerApi: "api-rinkeby.etherscan.io/api",
    contracts: {
      mainGateway: "0xa6BaAA13CD9d027e15Ae219C90b90991Af373796",
      loomGateway: "0x065F7D2636880aE34a98dD7600b9bD1D5EcAFA97",
    },
    portisKey: "10589118-6329-43a0-818c-93800c206786",
    formaticKey: "pk_test_58DB7D96C460470B",
    gatewayVersions: {
      loom: 2,
      main: 2,
    },
  },
  binance: {
    networkId: "97",
    networkName: "bsc-testnet",
    genericNetworkName: "Binance Smart Chain",
    chainId: "eth", // NOTE: not a typo, use the same chain ID as Ethereum to reuse account mappings etc.
    nativeTokenSymbol: "BNB",
    nativeTokenDecimals: 18,
    endpoint: "https://data-seed-prebsc-1-s1.binance.org:8545",
    blockExplorer: "https://testnet.bscscan.com",
    blockExplorerApi: "api-testnet.bscscan.com/api",
    contracts: {
      loomGateway: "0x0cee0FB12205b9Ca9d4Fbed502091dEfD7ae6ff5",
      mainGateway: ethers.constants.AddressZero, // NOTE: generic gateway is not deployed on BSC yet
    },
    gatewayVersions: {
      loom: 1,
      main: 1,
    },
  },
  dpos: {
    bootstrapNodes: [],
    analyticsUrl: "//dev-api.loom.games",
  },
  coinDataUrl: "/tokens/dev.tokens.json",
  gateway: {
    chains: ["ethereum"],
    binance: {
      gatewayAccount: "tbnb14sa7gnlalxd0e336clc0ltgke6e6hdanyl6pqq",
      fee: 37500,
    },
    tokenContractLogsURL: "https://dev-api.loom.games/plasma/tokencontract/eth:{address}",
    withdrawalLimit: true,
  },
  disabled: [],
  chains: ["ethereum", "binance"],
  announcement: {
    validatorsPage: false,
    popup: false,
    home: false,
  },
  features: {
    bscWallets: true,
  },
} as DashboardConfig
