<template>
  <div>
    <div class="row">
      <div class="col"><span>{{item.name}}</span></div>
      <div class="col"><abbr>{{item.totalStaked | tokenAmount}}</abbr></div>
      <div class="col"><abbr>{{item.fee}}</abbr></div>
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