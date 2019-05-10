<template>
  <div>
    <div class="container">
      <div class="wallet-list">
        <div class="wallet-item" v-for="(wallet, index) in wallets" :key="index" 
        @click="onSelectWallet(index)" :class="{ 'wallet-active': activeIndex === index}">
          <img :src="wallet.img" />
          <h2>{{ `${wallet.balance} ${wallet.currency}` }}</h2>
          <div class="mask"></div>
        </div>
      </div>
      <div class="wallet-detail">
        <h2> {{ activeWallet.name }} </h2>
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
      'getPendingWithdrawalReceipt'
    ])
  },
  computed: {
    ...DPOSStore.mapState([
      'userBalance'
    ]),
    ...DappChainStore.mapState([
      'dposUser',
      'web3'
    ])
  }
})

export default class DepositWithdraw extends Vue {
  currentAllowance = 0
  wallets = [
    {
      name: 'Loom',
      address: '',
      balance: null,
      currency: 'LOOM',
      img: require('../assets/logo.png')
    },
    {
      name: 'Ethereum',
      address: '',
      balance: null,
      currency: 'ETH',
      img: require('../assets/ethereum-icon.svg')
    }
  ]
  
  activeWallet = null
  activeIndex = 0

  onSelectWallet (index) {
    this.activeWallet = this.wallets[index]
    this.activeIndex = index
  }
  created () {
    this.activeWallet = this.wallets[0]
  }
  async mounted () {
    const dposUser = await this.dposUser
    this.wallets[0].address = dposUser.loomAddress.local.toString() // set loomAddress to wallet
    this.wallets[1].address = dposUser.ethAddress // set ethAddress to wallet

    Promise.all([this.web3.eth.getBalance(dposUser.ethAddress)]).then(result => {
      this.wallets[0].balance = this.userBalance.loomBalance // Loom mainet
      this.wallets[1].balance = parseFloat(result[0]).toFixed(2)
    })
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

