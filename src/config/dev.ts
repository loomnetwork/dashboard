export default {
  name: "dev",
  plasma: {
    networkId: "asia1",
    chainId: "asia1",
    endpoint: "wss://test-z-asia1.dappchains.com",
  },
  ethereum: {
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "wss://rinkeby.infura.io/ws",
    etherScan: "https://rinkeby.etherscan.io",
    blockExplorer: "http://asia1-blockexplorer.devdc.io",
    contracts: {
      gateway: "0xe57e0793f953684bc9d2ef3d795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
  },
  coinDataUrl: "",
}
