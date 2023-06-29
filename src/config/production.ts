import { DashboardConfig } from "@/types"
import { ethers } from "ethers"

export default {
  name: "production",
  plasma: {
    networkId: "plasma",
    chainId: "default",
    endpoint: "wss://basechain.dappchains.com",
    blockExplorer: "https://basechain-blockexplorer.dappchains.com",
    loomGamesEndpoint: "https://loom.games/en/dpos-link",
    historyUrl: "https://api.loom.games/plasma/address/{address}?sort=-block_height",
  },
  ethereum: {
    networkId: "1",
    networkName: "mainnet",
    genericNetworkName: "Ethereum",
    chainId: "eth",
    nativeTokenSymbol: "ETH",
    nativeTokenDecimals: 18,
    endpoint: `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`,
    blockExplorer: "https://etherscan.com",
    blockExplorerApi: "api.etherscan.io/api",
    contracts: {
      mainGateway: "0xe080079ac12521d57573f39543e1725ea3e16dcc",
      loomGateway: "0xfcf1e3fa575a313fd81fea2caa06269b49f1a528",
    },
    gatewayVersions: {
      loom: 1,
      main: 1,
    },
  },
  binance: {
    networkId: "56",
    networkName: "bsc-mainnet",
    genericNetworkName: "Binance Smart Chain",
    chainId: "eth",
    nativeTokenSymbol: "BNB",
    nativeTokenDecimals: 18,
    endpoint: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    blockExplorerApi: "api.bscscan.com/api",
    contracts: {
      mainGateway: ethers.constants.AddressZero, // NOTE: generic gateway is not deployed on BSC yet
      loomGateway: "0x37939c8Bdbf6BCb6fFBC9519f88027CFe9dFe6D7",
    },
    gatewayVersions: {
      loom: 1,
      main: 1,
    },
  },
  dpos: {
    bootstrapNodes: [
      "0x0e99fc16e32e568971908f2ce54b967a42663a26", // plasma-0
      "0xCcE0021b0DE03C5fab36059f37dB003354bF98fb",
    ],
    analyticsUrl: "https://api.loom.games",
  },
  gateway: {
    chains: ["ethereum"],
    tokenContractLogsURL: "https://api.loom.games/plasma/tokencontract/eth:{address}",
    binance: {
      gatewayAccount: "bnb17mxq8p5jmw27dtt6s92fd35yltdml6snw3r98t",
      fee: 37500,
    },
    withdrawalLimit: false,
  },
  coinDataUrl: "/tokens/production.tokens.json",
  disabled: ["portis", "fortmatic", "walletconnect"],
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
