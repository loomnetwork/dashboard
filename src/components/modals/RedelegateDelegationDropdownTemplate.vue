<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-2 text-left">
        <strong>{{item.index}}</strong>
      </div>
      <div class="col-sm-4 text-left">
        <strong>Amount: </strong><span>{{item.amount | tokenAmount}}</span>
      </div>
      <div class="col-sm-6 text-left">
        <strong>Locktime: </strong><span>{{item.lockTime | readableDate}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: { required: true }
  }
}
</script>