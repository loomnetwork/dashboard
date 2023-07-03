import { DashboardConfig } from "@/types"
import { ethers } from "ethers"

export default {
  name: "ext-dev",
  plasma: {
    networkId: "extdev-plasma-us1",
    chainId: "extdev-plasma-us1",
    endpoint: "wss://extdev-plasma-us1.dappchains.com",
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
      loomGateway: "0x63E4efDf3786EaCa967A30D2Cdc154AaDC2526E6",
      mainGateway: "0x9c67fd4eaf0497f9820a3fbf782f81d6b6dc4baa",
    },
    portisKey: "10589118-6329-43a0-818c-93800c206786",
    formaticKey: "pk_test_58DB7D96C460470B",
    gatewayVersions: {
      loom: 1,
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
      loomGateway: "0x8Fa01da9B68dc0cAE32e12E8daFE9B136EfAbee6",
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
  coinDataUrl: "/tokens/ext-dev.tokens.json",
  gateway: {
    chains: ["ethereum", "binance"],
    tokenContractLogsURL: "",
    binance: {
      gatewayAccount: "tbnb1gc7azhlup5a34t8us84x6d0fluw57deuf47q9w",
      fee: 37500,
    },
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
