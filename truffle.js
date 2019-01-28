/* eslint-disable no-undef */
const { join } = require('path')
const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  contracts_build_directory: join(__dirname, './src/contracts'),
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    ganache: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/5Ic91y0T9nLh6qUg33K0')
      },
      network_id: 4
    }
  }
}
