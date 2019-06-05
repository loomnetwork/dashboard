<template>
  <div id="transaction" class="row pb-5 pt-5">
    <div class="col-md-2 col-lg-1">
      <img src="../assets/card.png" class="transaction-item img-fluid">
    </div>
    <div class="col-md-10 col-lg-11">
      <div class="row">
        <div class="col-sm-3 text-left"><h4>{{ $t('components.blockExplorer.transaction.push') }}</h4></div>
        <div class="col-sm-3 text-left"><span>{{ $t('components.blockExplorer.transaction.type') }} </span><strong>{{ $t('components.blockExplorer.transaction.walker') }}</strong></div>
        <div class="col-sm-6 text-right"><h6><strong>{{ $t('components.blockExplorer.transaction.listing_price_1_99') }}</strong></h6></div>
      </div>
      <div class="row">
        <div class="col-sm-3 text-left"><span>{{ $t('components.blockExplorer.transaction.rarity') }} </span><strong>{{ $t('components.blockExplorer.transaction.rare') }}</strong></div>
        <div class="col-sm-3 text-left"><span>{{ $t('components.blockExplorer.transaction.entry') }} </span><strong>{{ $t('components.blockExplorer.transaction.return_a_zombie_to_hand') }}</strong></div>
        <div class="col-sm-6 text-right"><strong class="transaction-status">{{ $t('components.blockExplorer.transaction.sold') }}</strong></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from "vue"
  import { Component } from "vue-property-decorator"

  @Component
  export default class Transaction extends Vue {
    isOpen = true
    preload = false

    mounted() {
      // console.log("Card ribbon mounted with prop", this.daysRemaining)
    }
  }
</script>
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
