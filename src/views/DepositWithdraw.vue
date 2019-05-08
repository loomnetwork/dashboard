<template>
  <div>
    <div class="container">
      <div class="wallet-list">
        <div class="wallet-item" v-for="(wallet, index) in wallets" :key="index" @click="onSelectWallet(index)">
          <img :src="wallet.img" />
          <h2>{{ `${wallet.balance} ${wallet.currency}` }}</h2>
        </div>
      </div>
      <div class="wallet-detail">
        <h2> {{ activeWallet.name }} </h2>
        <p>{{ activeWallet.key }}</p>
        <div class="buttons">
          <div class="button" @click="setShowDepositForm(true)">Deposit</div>
          <div class="button">Withdraw</div>
          <div class="disable">Swap</div>
        </div>
      </div>
    </div>
    <DepositForm />
  </div>
</template>

<script>
import Vue from 'vue'
import DepositForm from '@/components/gateway/DepositForm'
import { Component } from 'vue-property-decorator'
import { createNamespacedHelpers } from 'vuex'

const DPOSStore = createNamespacedHelpers('DPOS')

@Component({
  components: {
    DepositForm
  },
  methods: {
    ...DPOSStore.mapMutations([
      'setShowDepositForm'
    ])
  }
})

export default class DepositWithdraw extends Vue {
  wallets = [
    {
      name: 'Ethereum',
      key: 'xxxxxxxxxxxxxxxxxxx',
      balance: '00.00',
      currency: 'ETH',
      img: ''
    },
    {
      name: 'Loom',
      key: 'xxxxxxxxxxxxxxxxxxx',
      balance: '00.00',
      currency: 'LOOM',
      img: 'https://s2.coinmarketcap.com/static/img/coins/200x200/2588.png'
    }
  ]
  activeWallet = null

  onSelectWallet (index) {
    this.activeWallet = this.wallets[index]
  }
  created () {
    this.activeWallet = this.wallets[0]
  }
}
</script>

<style lang="scss" scoped>
.container {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 16px 24px;
  margin: 16px;
  box-shadow: #cecece54 0 2px 5px 0px;
  display: flex;
  .wallet-list {
    width: 30%;
    .wallet-item {
      display: flex;
      padding: 1em;
      align-items: center;
      h2 {
        margin: 0;
        font-size: 1.8rem;
      }
    }
  }
  .wallet-detail {
    border-left: 1px solid rgba(0, 0, 0, 0.05); 
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
.mask {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.1);
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

