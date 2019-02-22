<template>
  <div>
    <div class="row">
      <div class="col"><span>{{item.Name}}</span></div>
      <div class="col"><abbr>{{item.Stake}}</abbr></div>
      <div class="col"><abbr>{{item.Fees}}</abbr></div>
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