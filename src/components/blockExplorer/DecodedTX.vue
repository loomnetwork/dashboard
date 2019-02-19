<template>
  <div>
    <TxPreviewField label="Method:" class="kind" :value="txMethod"/>
    <div class="text-label">{{ $t('components.blockExplorer.decoded_tx.transaction_data') }}</div>
    <hr>
    <div class="json-view">
      <vue-json-pretty :data="txJSONData">
      </vue-json-pretty>
    </div>
  </div>

</template>

<script lang="ts" src="./decoded-tx.ts">
</script>

<style scoped lang="scss">
.json-view {
  max-height: 400px;
  overflow-y:auto;
  background-color: #37474f;
}

hr{
  border-top: 1px solid white;
}
</style>

