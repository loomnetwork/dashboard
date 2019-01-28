<template>
  <div id="transaction" class="row pb-5 pt-5">
    <div class="col-md-2 col-lg-1">
      <img src="../assets/card.png" class="transaction-item img-fluid">
    </div>
    <div class="col-md-10 col-lg-11">
      <div class="row">
        <div class="col-sm-3 text-left"><h4>Push</h4></div>
        <div class="col-sm-3 text-left"><span>Type: </span><strong>Walker</strong></div>
        <div class="col-sm-6 text-right"><h6><strong>Listing Price: $1.99</strong></h6></div>
      </div>
      <div class="row">
        <div class="col-sm-3 text-left"><span>Rarity: </span><strong>Rare</strong></div>
        <div class="col-sm-3 text-left"><span>Entry: </span><strong>Return a zombie to hand</strong></div>
        <div class="col-sm-6 text-right"><strong class="transaction-status">Sold</strong></div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Component } from 'vue-property-decorator'

  @Component
  export default class Transaction extends Vue {
    isOpen = true
    preload = false

    mounted() {
      console.log('Card ribbon mounted with prop', this.daysRemaining)
    }
  }</script>
<style lang="scss" scoped>
#transaction {
  color: #ffffff;
  border-bottom: 2px solid #1f2739;
}

.transaction-item {
  position: relative;
  top: -10px;
}

.transaction-status {
  color: #ff2ecc;
}
</style>
