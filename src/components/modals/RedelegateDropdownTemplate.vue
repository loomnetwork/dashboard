<template>
  <div class="container">
    <div class="row">
      <div class="col-xs-12"><span>{{item.name}}</span></div>
    </div>
    <div class="row">
      <div class="col-xs-12">

        Total staked:
        <strong>
          <abbr>{{item.totalStaked | tokenAmount}}</abbr>
        </strong>

       </div>
    </div>
    <div class="row">
      <div class="col-xs-12">

        Fee:
        <strong>
          <abbr>{{item.fee}}%</abbr>
        </strong>

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