<template>
  <div class="faucet">
    <div class="faucet-content">
      <div class="container mb-5 column py-3 p-3 d-flex" >
        <h1>{{ $t('views.history.trade_history') }}</h1>
        <faucet-table :items="history"></faucet-table>
      </div>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue'
  import { Component } from 'vue-property-decorator'
  import FaucetTable from '../components/FaucetTable'

  @Component({
    components: {
      FaucetTable
    }
  })
  export default class History extends Vue {

  history = [
    {
      ID: 2349134,
      Date: "3/14/18",
      Amount: "10000 LOOM",
      To: "trdzvzr7...",
      From: "Me"
    },
    {
      ID: 2349134,
      Date: "3/14/18",
      Amount: "10000 LOOM",
      To: "trdzvzr7...",
      From: "Me"
    },
    {
      ID: 2349134,
      Date: "3/14/18",
      Amount: "10000 LOOM",
      To: "trdzvzr7...",
      From: "Me"
    }
  ]


  }</script>

<style lang="scss" scoped>
  .dropdown-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
