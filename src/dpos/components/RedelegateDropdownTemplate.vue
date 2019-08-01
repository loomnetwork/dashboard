<template>
  <div class="container">
    <div class="row">
      <div class="col-xs-12"><span>{{item.name}}</span></div>
    </div>
    <div class="row">
      <div class="col-xs-12">

        {{ $t('components.modals.faucet_redelegate_modal.total_stake') }}:
        <strong>
          <abbr>{{item.totalStaked | tokenAmount}}</abbr>
        </strong>

       </div>
    </div>
    <div class="row">
      <div class="col-xs-12">

        {{ $t('components.modals.faucet_redelegate_modal.fee') }}
        <strong>
          <abbr>{{item.fee}}%</abbr>
        </strong>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    item: { required: true },
  },
}
</script>