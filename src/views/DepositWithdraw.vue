<template>
  <div>
    <div class="container">
      <div class="wallet-list">
        <b-form-input v-model="inputFilter" placeholder="Search" @keyup="filterToken"></b-form-input>
        
        <div class="wallet-item" v-for="(wallet, index) in filteredToken" :key="index" @click="onSelectWallet(wallet)" :class="{ 'wallet-active': activeWallet === wallet}">
          <!-- <img :src="wallet.img" /> -->
          <h2>{{ `${wallet.balance} ${wallet.symbol}` }}</h2>
          <div class="mask"></div>
        </div>

      </div>
      <div class="wallet-detail">
        <h2>{{ `${balance} ${activeWallet.symbol}` }}</h2>
        <p>{{ activeWallet.address }}</p>
          
        <div class="buttons">
          <div class="button" @click="setShowDepositForm(true)">Deposit</div>
          <div class="button" @click="setShowDepositForm(true)">Withdraw</div>
          <div class="disable">Swap</div>
        </div>
      </div>
    </div>
    <DepositForm />
  </div>
</template>

<script>
import Vue from 'vue'
import LoomIcon from '@/components/LoomIcon'
import DepositForm from '@/components/gateway/DepositForm'
import { Component } from 'vue-property-decorator'
import { createNamespacedHelpers } from 'vuex'
import { CLIENT_RENEG_LIMIT } from 'tls';
import { close } from 'fs';
import { filter } from 'rxjs/operators';
import { get } from 'http';
import { toBigNumber, getValueOfUnit, isBigNumber } from '../utils'
import { fileURLToPath } from 'url';


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
      'updateCurrentToken'
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
      'ethCoinInstance'
    ])
  // },
  // watch: {
  //   currentTokenBalance: function(oldValue, newValue) {
  //     if (newValue && this.balanceIntervalHandler) {
  //       clearInterval(this.balanceIntervalHandler)
  //       this.setDepositState(2)
  //     }
  //   }
  }
})

export default class DepositWithdraw extends Vue {
  currentAllowance = 0
  // currentUnit = 'ETH'
  
  filteredToken = []
    
  activeWallet = null
  tokens = []
  inputFilter = ''

  async mounted () {
    const dposUser = await this.dposUser

    Promise.all([this.getTokensDetails()])
    .then(result => {
      const [allToken] = result
      const balance = parseFloat(this.dappchainBalance*Math.pow(10,18)).toFixed(2) //Eth plasma
      const ethToken = {
        filename: "Ethereum",
        name: "ETH",
        decimal: 18,
        symbol: "ETH",
        address: dposUser.ethAddress, // set ethAddress to wallet
        balance: balance
      }
      this.filteredToken = [ethToken, ...allToken]
      this.activeWallet = this.filteredToken[0]
      console.log('filtered: ', this.ethCoinInstance.balance);
    }) 

    await this.unitChangeHandler('ETH')
  }
  
  // created () {
  //   this.activeWallet = this.filteredToken[0]
  //   console.logthis.activeWallet;
  // }
  async onSelectWallet (wallet) {
      this.activeWallet = wallet
      // this.balanceIntervalHandler = setInterval(() => this.checkTokenBalance(), 100000)
      await this.unitChangeHandler(wallet.symbol)
  }
  filterToken(){
    if(this.inputFilter != null) {
      let filterToken = this.tokens.filter(token => {
        return token.symbol.includes(this.inputFilter.toUpperCase()) ? token : null
      })
      this.filteredToken = filterToken
    } else { this.filteredToken.push(this.getTokensDetails()) }
  }
  get balance() {
        let returnValue = toBigNumber(this.currentTokenBalance).dividedBy(getValueOfUnit('ether'))
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
  display: flex;
  padding: 0;
  .wallet-list {
    width: 30%;
    .wallet-item {
      box-shadow: inset #d8d8d878 0 2px 12px 0px;
      display: flex;
      padding: 28px;
      opacity: 0.5;
      align-items: center;
      h2 {
        margin: 0;
        font-size: 1.8rem;
        white-space: nowrap;
      }
      .mask {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
    .wallet-item:hover, .wallet-active {
      opacity: 1;
      box-shadow: none;
    }
  }
  .wallet-detail {
    width: 70%;
    padding: 24px;
    .buttons {
      display: flex;
      .button{
        width: 33.33%;
        text-align: center;
        background-color: white;
        color: #5756e6;
        border: 1px solid #5756e6;
        border-radius: 4px;
        padding: 16px 0px;
        margin: 24px 16px;
      }
      .button:hover{
        box-shadow: #cececed6 0 2px 2px 0px;
        background-color: #5756e6;
        color: white;
        cursor: pointer;
      }
  
    }
  }
  
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
  padding: 16px 0px;
  margin: 24px 16px;
}


</style>

