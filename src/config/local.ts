export default {
  name: "local",
  plasma: {
    networkId: "default",
    chainId: "default",
    endpoint: "ws://localhost:46658",
  },
  ethereum: {
    networkId: "default",
    networkName: "Ganache",
    endpoint: "ws://localhost:8484",
    blockExplorer: "",
    chainId: "eth",
    contracts: {
      gateway: "0xE57e0793f953684Bc9D2EF3D795408afb4a100c3",
      loomGateway: "0x76c41effc2871e73f42b2eae5eaf8efe50bdbf73",
    },
  },
  coinDataUrl: "",
}
