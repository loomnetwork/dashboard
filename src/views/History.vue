<template>
  <div class="container">
    <page-header title="Trade History">
      <div class="breadcrumps" slot="breadcrumps">
        <router-link to="/" class="active">Home</router-link>
        /
        <router-link to="/browse" class="current">Trade History</router-link>
      </div>
      <div slot="right-section">
        <span class="sort-label">Sort by:</span>
        <b-button-group class="custom-dropdown-btn">
          <b-dropdown right split text="Added">
            <b-dropdown-item>Item 1</b-dropdown-item>
            <b-dropdown-item>Item 2</b-dropdown-item>
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
