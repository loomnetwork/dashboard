<template>
  <div class="block-explorer-tx-table">
    <b-table
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :show-empty="true"
      :items="items"
      :fields="fields"
      :hover="true"
      :head-variant="muted"
      @row-clicked="rowClickHandler"
      class="table-dark bg-dark">
      <template slot="hash" slot-scope="row">
        <span>{{ row.value }}</span>
      </template>
      <template slot="blockHeight" slot-scope="row">
        <span class="text-info">{{ row.value }}</span>
      </template>
      <template slot="txType" slot-scope="row">
        {{ row.value }}
      </template>
      <template slot="age" slot-scope="row">
        {{ row.value }}
      </template>
      <template slot="sender"  slot-scope="row">
        <span class="author">{{row.value}}</span>
      </template>
    </b-table>
  </div>
</template>

<style lang="scss" scoped>
// @import '~@/assets/scss/bootstrap-override.scss';
@import '~@/assets/scss/mixin';
@import '~@/assets/scss/variables';

.block-explorer-tx-table {
  table .thead-gray th {
    background-color: theme-color('muted');
    border: none;
  }

  table th,
  table td {
    font-size: 18px;
    border-color: #2d2c2c;
    letter-spacing: 0.4px;
    text-align: center;
    color: #ffffff;
    font-weight: normal !important;
    &:first-child {
      text-align: left;
      padding-left: 20px;
    }
    &:last-child {
      text-align: right;
      padding-right: 20px;
    }
  }
  table  td {
    font-size: 16px;
    padding: 11px 12px;
  }
}

.author {
  color: $info-green;
}
</style>

<script lang="ts" src="./transaction-table.ts"></script>
