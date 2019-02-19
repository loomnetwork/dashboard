<template>
  <div class="container">
    <page-header title="Trade History">
      <div class="breadcrumps" slot="breadcrumps">
        <router-link to="/" class="active">{{ $t('views.history.home') }}</router-link>
        {{ $t('views.history.') }}
        <router-link to="/browse" class="current">{{ $t('views.history.trade_history') }}</router-link>
      </div>
      <div slot="right-section">
        <span class="sort-label">{{ $t('views.history.sort_by') }}</span>
        <b-button-group class="custom-dropdown-btn">
          <b-dropdown right split text="Added">
            <b-dropdown-item>{{ $t('views.history.item_1') }}</b-dropdown-item>
            <b-dropdown-item>{{ $t('views.history.item_2') }}</b-dropdown-item>
          </b-dropdown>
        </b-button-group>
      </div>
    </page-header>
    <transaction v-for="n in 5"></transaction>
  </div>
</template>


<script>
  import Vue from 'vue'
  import { Component } from 'vue-property-decorator'
  import PageHeader from '@/components/PageHeader'
  import Transaction from '@/components/Transaction'

  @Component({
    components: {
      PageHeader,
      Transaction,
    },
  })
  export default class History extends Vue {

  }</script>

<style lang="scss" scoped>
  .dropdown-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
