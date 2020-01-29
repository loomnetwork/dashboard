import { DashboardConfig } from "@/types"

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
    chainId: "eth",
    endpoint: "wss://mainnet.infura.io/ws/v3/5Ic91y0T9nLh6qUg33K0",
    blockExplorer: "https://etherscan.com",
    contracts: {
      mainGateway: "0xe080079ac12521d57573f39543e1725ea3e16dcc",
      loomGateway: "0x8f8e8b3c4de76a31971fe6a87297d8f703be8570",
    },
  },
  dpos: {
    bootstrapNodes: [
      "0x0e99fc16e32e568971908f2ce54b967a42663a26",
      "0xac3211caecc45940a6d2ba006ca465a647d8464f",
      "0x69c48768dbac492908161be787b7a5658192df35",
      "0x2a3a7c850586d4f80a12ac1952f88b1b69ef48e1",
      "0x4a1b8b15e50ce63cc6f65603ea79be09206cae70",
      "0x0ce7b61c97a6d5083356f115288f9266553e191e",
    ],
    analyticsUrl: "https://api.loom.games",
  },
  gateway: {
    chains: ["ethereum"],
    multisig: {
      loom: false,
      main: false,
    },
    checkMarketplaceURL: "https://auth.loom.games/wallet/address?address={address}&wallet=eth",
    tokenContractLogsURL: "https://api.loom.games/plasma/tokencontract/eth:{address}",
    binance: {
      gatewayAccount: "bnb17mxq8p5jmw27dtt6s92fd35yltdml6snw3r98t",
      fee: 37500,
    },
    withdrawalLimit: false
  },
  coinDataUrl: "/tokens/production.tokens.json",
  disabled: ["portis", "fortmatic", "walletconnect"],
  chains: ["ethereum", "binance"],
  announcement: {
    validatorsPage: true,
    popup: false,
    home: true,
  },
} as DashboardConfig
