<template>
  <div class="position-relative">
    <div>
      <div class="section-header d-flex flex-row">
        <div class="bg-dark col-9">
          <h3 class="text-primary pointer-only">{{ $t('components.blockExplorer.block_info.transactions') }}</h3>
          <ConnectionStatus :blockchain="blockchain"/>
        </div>
        <div class="bg-dark ml-auto px-0">
          <div class="d-flex flex-row">
            <h3 class="mx-2 text-white pointer-only">{{ $t('components.blockExplorer.transaction_list.filter_by') }}</h3>
            <b-dropdown text="Most recent" right variant="dark">
              <b-dropdown-item>{{ $t('components.blockExplorer.transaction_list.most_old') }}</b-dropdown-item>
              <b-dropdown-item>{{ $t('components.blockExplorer.transaction_list.pending') }}</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <TransactionTable v-bind="txTableProps"/>
    </div>
<!--     <div class="tx-info-overlay" :class="{ show: isTxInfoVisible }">
      <BlockInfo class="tx-info-card" v-bind="txInfoProps"/>
    </div> -->
  </div>
</template>


<style lang="scss" scoped>
.tx-info-overlay {
  position: absolute;
  z-index: 100;
  top: 0;
  right: calc(-50%);
  width: 0;
  height: 100%;
  // slide-in/out the overlay from the right
  transition-property: right, width;
  transition-duration: 0.3s;

  &.show {
    right: 0;
    width: 50%;
  }
}

.tx-info-card {
  width: 100%;
  height: 100%;
}
</style>

<script lang="ts" src="./transaction-list.ts"></script>
