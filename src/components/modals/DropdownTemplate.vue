<template>
  <div>
    <div class="row">
      <div class="col"><span>{{item.label}}</span></div>
      <div class="col"><abbr>{{item.path}}</abbr></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: { required: true },
    searchText: { required: true }
  }
}
</script>