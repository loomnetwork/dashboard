export const envs = [
  {
    name: "production",
    networkId: "1",
    networkName: "mainnet",
    chainId: "eth",
    endpoint: "wss://mainnet.infura.io/ws",
    blockExplorer: "https://etherscan.com/{txHash}",
    erc20: {
      loom: "",
      bnb: "",
      tron: "",
    },
  },
  {
    name: "stage",
    networkId: "4",
    networkName: "rinkeby",
    chainId: "eth",
    endpoint: "wss://rinkeby.infura.io/ws",
    blockExplorer: "https://rinkeby.etherscan.com/{txHash}",
    erc20: {
      loom: "",
      bnb: "",
      tron: "",
    },
  },
  {
    name: "dev",
    networkId: "4",
    networkName: "rinkeby",
    endpoint: "wss://rinkeby.infura.io/ws",
    blockExplorer: "https://rinkeby.etherscan.com/{txHash}",
    chainId: "eth",
    erc20: {
      loom: "",
      bnb: "",
      tron: "",
    },
  },
  {
    name: "custom",
    networkId: "default",
    networkName: "Local",
    endpoint: "ws://localhost:8484",
    blockExplorer: "",
    chainId: "eth",
    erc20: {
      loom: "",
      bnb: "",
      tron: "",
    },
  },
]
