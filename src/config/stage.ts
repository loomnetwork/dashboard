export default {
  name: "stage",
  plasma: {
    networkId: "us1",
    chainId: "default",
    endpoint: "wss://test-z-us1.dappchains.com",
  },
  ethereum: {
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "wss://rinkeby.infura.io/ws",
    etherScan: "https://rinkeby.etherscan.io",
    blockExplorer: "http://plasma-blockexplorer.dappchains.com", // update this to correct one
    contracts: {
      gateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
  },
  coinDataUrl: "",
}
