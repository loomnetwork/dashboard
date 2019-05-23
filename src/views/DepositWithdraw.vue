<template>
  <div>
    <div class="container">
      <b-form-input v-model="inputFilter" placeholder="Search" @keyup="filterToken"></b-form-input>
      <div class="loading" v-if="filteredToken.length == 0">
        <b-spinner variant="primary" label="Spinning"></b-spinner>
      </div>
      <b-table class="wallet-detail" :items="filteredToken" :fields="selectedField" v-else> 
        <template slot="Action" slot-scope="row">
          <b-button class="button" @click="setShowDepositForm(true)">Deposit</b-button>
          <b-button class="button" @click="onSelectWallet()">Withdraw</b-button>
          <b-button class="button" disabled>Swap</b-button>
        </template>
      </b-table>
    </div>
    <DepositForm />
  </div>
</template>

<script>
import Vue from 'vue'
import LoomIcon from '@/components/LoomIcon'
import DepositForm from '@/components/gateway/DepositForm'
import { Component, Watch } from 'vue-property-decorator'
import { createNamespacedHelpers } from 'vuex'
import { CLIENT_RENEG_LIMIT } from 'tls';
import { close, watch } from 'fs';
import { filter } from 'rxjs/operators';
import { get } from 'http';
import { toBigNumber, getValueOfUnit, isBigNumber, formatToCrypto } from '../utils'
import { fileURLToPath } from 'url';
import { log, debug } from 'util';
import BN from 'bn.js';
import { async } from 'rxjs/internal/scheduler/async';
import { DPOSUserV3 } from 'loom-js';

const DappChainStore = createNamespacedHelpers('DappChain')
const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    DepositForm,
    LoomIcon
  },
  methods: {
    ...DPOSStore.mapMutations([
      'setShowDepositForm'
    ]),
    ...DappChainStore.mapActions([
      'getMetamaskLoomBalance',
      'getPendingWithdrawalReceipt',
      'getDappchainLoomBalance',
      'getTokensDetails',
      'checkTokenBalance',
      'updateCurrentToken',
      'checkDappchainEthBalance',
      'createEthCoinInstance'
    ])
  },
  computed: {
    ...DPOSStore.mapState([
      'userBalance'
    ]),
    ...DappChainStore.mapState([
      'dposUser',
      'web3',
      'tokenDetails',
      'dappchainBalance',
      'ethCoinInstance',
      'currentTokenBalance'
    ])
  },
})

export default class DepositWithdraw extends Vue {
  currentAllowance = 0
  filteredToken = []
  activeWallet = null
  selectedField = ['symbol','balance','Action']
  tokens = []
  inputFilter = ''
  balance = null

  mounted() {
    // if (this.ethCoinInstance) {
    //   return this.ready()
    // }
    this.ready()
  }

  @Watch("dposUser")
  async ready(){
    // Need to refactor
    await this.unitChangeHandler('ETH')
    const user = await this.dposUser
    const tokenDetail = await Promise.all([this.getTokensDetails()])
    const [allToken] = tokenDetail
    const ethBalance = parseFloat(this.dappchainBalance.ETH*Math.pow(10,18)).toFixed(2) //Eth plasma
    const ethToken = {
      filename: "Ethereum",
      name: "ETH",
      decimal: 18,
      symbol: "ETH",
      address: user.ethAddress, // set ethAddress to wallet
      balance: ethBalance
    }
    this.tokens = [...allToken]
    const tokensSymbol = this.tokens
      .map(token => { return this.updateCurrentToken({symbol: token.symbol}) })
  
    this.balance = await this.getBalance("ETH")
    await Promise.all(tokensSymbol.slice(0,20))
    await Promise.all(tokensSymbol.slice(20,40))
    await Promise.all(tokensSymbol.slice(40,60))
    await Promise.all(tokensSymbol.slice(60,80))
    await Promise.all(tokensSymbol.slice(80))
    this.tokens = this.tokens.map(token => {
      if(!this.dappchainBalance[token.symbol]) return
      return {...token, balance: this.dappchainBalance[token.symbol]} 
    })
    this.filteredToken = this.tokens
  }

  filterToken(){
    if(this.inputFilter != null) {
      this.filteredToken = this.tokens.filter(token => {
        return token.symbol.includes(this.inputFilter.toUpperCase()) ? token : null
      })
    } else { this.filteredToken = this.tokens }
  }

  getBalance(symbol) {
    let returnValue
    if(symbol === 'LOOM'){
      returnValue = toBigNumber(this.dappchainBalance[symbol])
    }else{
      returnValue = toBigNumber(this.currentTokenBalance).dividedBy(getValueOfUnit('ether'))
    }
    return isBigNumber(this.currentTokenBalance)
      ? returnValue.toFixed(6)
      : returnValue.toFixed(6).toString(10)
  }

  async unitChangeHandler(symbol) {
    await this.updateCurrentToken({ symbol: symbol })
  }
}
</script>

<style lang="scss" scoped>
.container {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  margin: 16px;
  box-shadow: #cecece54 0 2px 5px 0px;

  padding: 24px;
}
.wallet-detail {
  padding: 24px;
}
.button {
  margin: 0 8px;
}
img {
  width: 64px;
  height: 64px;
  background-color: white;
  border-radius: 48px;
  margin-right: 1em;
}

.disable{
  border: 1px solid gray;
  color: gray;
  width: 33.33%;
  text-align: center;
  background-color: white;
  border-radius: 4px;
  padding: 16px 16px;
  margin: 24px 16px;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 100px;
}
</style>
