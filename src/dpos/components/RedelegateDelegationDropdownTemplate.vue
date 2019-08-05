<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-2 text-left">
        <strong>{{item.index}}</strong>
      </div>
      <div class="col-sm-4 text-left">
        <strong>{{ $t('components.modals.faucet_delegate_modal.amount') }} </strong><span>{{item.amount | tokenAmount}}</span>
      </div>
      <div class="col-sm-6 text-left">
        <strong>{{ $t('components.modals.faucet_delegate_modal.locktime') }}: </strong><span>{{item.lockTime | readableDate}}</span>
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