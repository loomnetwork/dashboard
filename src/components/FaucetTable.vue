<template>
  <b-table
    responsive
    id="faucet-table"
    table-active="table-active"
    tr-class="spacer"
    :items="items"
    :fields="fields"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    @row-clicked="rowClickHandler">
  </b-table>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"

@Component({
  props: ["items", "fields", "sortBy", "sortDesc"],
})
export default class FaucetTable extends Vue {
  rowClickHandler(record, index) {
    const highlightedText = getSelection()!.toString()
    if (!highlightedText) {
      this.$emit("row-clicked", record, index)
    }
  }
}
</script>
<style lang="scss">
@import url('https://use.typekit.net/nbq4wog.css');
#faucet-table.table {
  border-collapse: separate;
  border-spacing: 0px 10px;
  thead th {
    border-top: none;
    border-bottom: none;
  }

  .table-active {
    color: #0dcd9b !important;
  }

  tbody tr :first-child  {
    border-left: 2px solid lightgray;
    border-radius: 5px 0 0 5px;
  }

  tbody tr td  {
    background: #f2f1f3;
    color: gray;
    border-top: 2px solid lightgray;
    border-bottom: 2px solid lightgray;
  }

  tbody tr :last-child  {
    border-right: 2px solid lightgray;
    border-radius: 0 5px 5px 0;
  }
}
</style>
