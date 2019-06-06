import { DahboardEnvs } from "@/types"
const configs = {
  plasma: {
    dappchainEndpoint : "wss://plasma.dappchains.com",
    mainnetEndpoint : "https://mainnet.infura.io",
    chainId : "default",
    gatewayAddress : "0x8f8e8b3c4de76a31971fe6a87297d8f703be8570",
    etherScan: "https://etherscan.io",
    blockExplorer: "https://blockexplorer.loomx.io",
  },
  asia1: {
    dappchainEndpoint : "https://test-z-asia1.dappchains.com",
    mainnetEndpoint : "https://rinkeby.infura.io",
    chainId : "default",
    gatewayAddress : "0x76c41eFFc2871e73F42b2EAe5eaf8Efe50bDBF73",
    etherScan: "https://rinkeby.etherscan.io",
    blockExplorer: "https://blockexplorer.loomx.io",
  },
  us1: {
    dappchainEndpoint : "wss://test-z-us1.dappchains.com",
    mainnetEndpoint : "https://rinkeby.infura.io",
    chainId : "default",
    gatewayAddress : "0xEA319a0Ea64f482060032b4BE8d9d3F7232c1214",
    etherScan: "https://rinkeby.etherscan.io",
    blockExplorer: "https://blockexplorer.loomx.io",
  },
  local: {
    dappchainEndpoint : "ws://localhost:46658", // 34361 //46658
    mainnetEndpoint : "http://localhost:8545",
    chainId : "default",
    gatewayAddress : "0x6804f48233F6Ff2b468f7636560d525ca951931e",
    etherScan: "https://rinkeby.etherscan.io",
    blockExplorer: "https://blockexplorer.loomx.io",
  },
} as DahboardEnvs

export default configs
